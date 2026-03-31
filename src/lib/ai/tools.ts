import { tool } from 'ai';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * TyFix AI Bot — Dealership Tool Definitions
 * Each tool queries/writes to Supabase via service_role client.
 */

export const dealershipTools = {
  search_inventory: tool({
    description:
      'Search the TyFix vehicle inventory. Use this whenever a customer asks about available cars, specific makes/models, price ranges, or body types. Returns matching active vehicles with details and photo URLs.',
    inputSchema: z.object({
      make: z
        .string()
        .optional()
        .describe('Vehicle make to filter by (e.g. Honda, Toyota, Ford)'),
      model: z
        .string()
        .optional()
        .describe('Vehicle model to filter by (e.g. Civic, Camry)'),
      max_price: z
        .number()
        .optional()
        .describe('Maximum price in dollars'),
      min_year: z
        .number()
        .optional()
        .describe('Minimum model year (e.g. 2015)'),
      body_type: z
        .string()
        .optional()
        .describe('Body type: Sedan, SUV, Truck, Coupe, Hatchback, Van, etc.'),
    }),
    execute: async ({ make, model, max_price, min_year, body_type }) => {
      const supabase = createAdminClient();

      let query = supabase
        .from('vehicles')
        .select('id, year, make, model, trim, mileage, price, body_type, transmission, exterior_color, condition_notes, featured_label, photos:vehicle_photos(public_url, sort_order)')
        .eq('listing_status', 'active')
        .order('sort_order', { ascending: true })
        .limit(8);

      if (make) query = query.ilike('make', `%${make}%`);
      if (model) query = query.ilike('model', `%${model}%`);
      if (max_price) query = query.lte('price', max_price);
      if (min_year) query = query.gte('year', String(min_year));
      if (body_type) query = query.ilike('body_type', `%${body_type}%`);

      const { data, error } = await query;

      if (error) {
        return { success: false, error: 'Failed to search inventory' };
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          count: 0,
          vehicles: [],
          message: 'No vehicles matching those criteria are currently available.',
        };
      }

      interface Photo {
        public_url: string;
        sort_order: number;
      }

      const vehicles = data.map((v) => ({
        id: v.id,
        title: `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''}`,
        price: v.price,
        mileage: v.mileage,
        body_type: v.body_type,
        transmission: v.transmission,
        color: v.exterior_color,
        condition: v.condition_notes,
        featured: v.featured_label,
        photo_url: v.photos && (v.photos as Photo[]).length > 0
          ? (v.photos as Photo[]).sort((a, b) => a.sort_order - b.sort_order)[0].public_url
          : null,
      }));

      return {
        success: true,
        count: vehicles.length,
        vehicles,
      };
    },
  }),

  create_lead: tool({
    description:
      'Save a potential customer as a lead. Use this when you have collected at least their name, and ideally their phone number, email, budget, or vehicle interest.',
    inputSchema: z.object({
      name: z.string().describe('Customer name'),
      phone: z.string().optional().describe('Phone number'),
      email: z.string().optional().describe('Email address'),
      budget: z.string().optional().describe('Stated budget or price range'),
      vehicle_interest: z
        .string()
        .optional()
        .describe('What vehicle(s) they are interested in'),
    }),
    execute: async ({ name, phone, email, budget, vehicle_interest }) => {
      const supabase = createAdminClient();

      const { error } = await supabase.from('leads').insert({
        name,
        phone: phone || '',
        email: email || '',
        message: budget ? `Budget: ${budget}` : null,
        vehicle_of_interest: vehicle_interest || '',
        status: 'new',
        lead_type: 'chatbot',
        contact_consent: true,
      });

      if (error) {
        return { success: false, error: 'Failed to save lead information' };
      }

      return {
        success: true,
        message: `Lead saved for ${name}.`,
      };
    },
  }),

  book_appointment: tool({
    description:
      'Book an appointment for a customer to visit the lot, see a specific vehicle, or take a test drive. Requires name, phone, preferred date, and preferred time.',
    inputSchema: z.object({
      name: z.string().describe('Customer name'),
      phone: z.string().describe('Phone number for confirmation'),
      preferred_date: z
        .string()
        .describe('Preferred visit date (e.g. "Monday", "March 15", "tomorrow")'),
      preferred_time: z
        .string()
        .describe('Preferred time (e.g. "10 AM", "afternoon", "2:00 PM")'),
      vehicle_interest: z
        .string()
        .optional()
        .describe('Vehicle they want to see'),
    }),
    execute: async ({ name, phone, preferred_date, preferred_time, vehicle_interest }) => {
      const supabase = createAdminClient();

      const { error } = await supabase.from('appointments').insert({
        name,
        phone,
        preferred_date,
        preferred_time,
        vehicle_interest: vehicle_interest || null,
        status: 'pending',
      });

      if (error) {
        return { success: false, error: 'Failed to book appointment' };
      }

      // Also save as a lead
      await supabase.from('leads').insert({
        name,
        phone,
        email: '',
        message: `Appointment: ${preferred_date} at ${preferred_time}`,
        vehicle_of_interest: vehicle_interest || '',
        status: 'new',
        lead_type: 'chatbot',
        contact_consent: true,
      });

      return {
        success: true,
        message: `Appointment booked for ${name} on ${preferred_date} at ${preferred_time}.`,
      };
    },
  }),

  check_hours: tool({
    description:
      'Get business hours, location, address, phone number, and directions info for TyFix Used Cars. Use when asked about when the lot is open, where it is, or how to get there.',
    inputSchema: z.object({
      query_type: z
        .enum(['hours', 'location', 'phone', 'all'])
        .optional()
        .describe('What info to retrieve: hours, location, phone, or all'),
    }),
    execute: async ({ query_type }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('site_settings')
        .select('phone_number, lot_address, hours_of_operation, directions_note')
        .limit(1)
        .single();

      if (error || !data) {
        return {
          phone: '(555) 123-4567',
          address: 'Coney Island, Brooklyn, NY 11224',
          hours: 'Mon - Sat: 9:00 AM - 6:00 PM | Sunday: Closed',
          directions: null,
        };
      }

      const info: Record<string, string | null> = {};
      const type = query_type || 'all';

      if (type === 'hours' || type === 'all') info.hours = data.hours_of_operation;
      if (type === 'location' || type === 'all') {
        info.address = data.lot_address;
        info.directions = data.directions_note;
      }
      if (type === 'phone' || type === 'all') info.phone = data.phone_number;

      return info;
    },
  }),
};
