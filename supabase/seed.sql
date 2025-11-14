-- Sample data for local development
truncate table public.notifications cascade;
truncate table public.complaint_messages cascade;
truncate table public.complaint_status_logs cascade;
truncate table public.complaint_assignments cascade;
truncate table public.complaint_category_links cascade;
truncate table public.complaints cascade;
truncate table public.complaint_categories cascade;
truncate table public.units cascade;
truncate table public.floors cascade;
truncate table public.buildings cascade;
truncate table public.users cascade;

insert into public.buildings (id, name, address, image_url)
values
  ('8f1f740a-9ebb-403f-8da9-3cffb0a0d999', 'Harbor View Tower', '123 Harbor Way, San Francisco, CA', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'),
  ('1d0218ea-8c60-4e61-a471-02d293baffd3', 'Laguna Offices', '88 Bay Street, San Francisco, CA', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80');

insert into public.floors (id, building_id, floor_number)
values
  ('7a8dc6f1-f9d7-4a06-9f92-8deeb25e9d01', '8f1f740a-9ebb-403f-8da9-3cffb0a0d999', 18),
  ('9e013773-3f6f-4d7e-a3e2-be23fbf6d8bb', '8f1f740a-9ebb-403f-8da9-3cffb0a0d999', 19),
  ('35f691aa-f4ff-4b75-862d-20decf82a4e9', '1d0218ea-8c60-4e61-a471-02d293baffd3', 5),
  ('6df93e73-505e-4a19-b8fe-07ed2ad12c62', '1d0218ea-8c60-4e61-a471-02d293baffd3', 6);

insert into public.units (id, building_id, floor_id, unit_number, tenant_name, tenant_contact, public_id)
values
  ('b78d7c6a-6d7f-4650-bd08-40863c19e781', '8f1f740a-9ebb-403f-8da9-3cffb0a0d999', '7a8dc6f1-f9d7-4a06-9f92-8deeb25e9d01', '18B', 'Priya Patel', jsonb_build_object('phone', '+14155550000'), '11111111-1111-1111-1111-111111111111'),
  ('0ddfb023-200e-4d7a-bcd6-4f73ad2343c9', '8f1f740a-9ebb-403f-8da9-3cffb0a0d999', '9e013773-3f6f-4d7e-a3e2-be23fbf6d8bb', '19A', 'Lee Wong', jsonb_build_object('phone', '+14155551111'), '22222222-2222-2222-2222-222222222222'),
  ('9a31c8d5-0a24-4f43-b224-9a2c25b3c8df', '1d0218ea-8c60-4e61-a471-02d293baffd3', '35f691aa-f4ff-4b75-862d-20decf82a4e9', '5C', 'Bloc Labs', jsonb_build_object('email', 'ops@bloclabs.test'), '33333333-3333-3333-3333-333333333333');

insert into public.complaint_categories (id, name, description, category_group)
values
  ('f1d49b63-69fd-4fa6-9fcf-4c4696d61c13', 'Electricity', 'Power outage, lighting, wiring', 'Critical'),
  ('9017b6c8-41e7-4db7-bc3b-6bb8368adf4a', 'Water Leakage', 'Leaks, dampness, burst pipes', 'Critical'),
  ('5856fa4d-7c2c-4e8c-aaaf-1fb724b2d5aa', 'Housekeeping', 'Cleaning requests', 'General'),
  ('619643dd-61f0-4dd8-a199-505f7ef74c77', 'HVAC', 'Air conditioning or heating issues', 'Comfort'),
  ('8f3a7bf7-528d-42af-9a74-3ce8a5d74885', 'Security', 'Access, locks, security guards', 'Security');

insert into public.users (id, full_name, email, role, service_worker_type)
values
  ('5c0bec21-4a69-4dcb-86b5-a2b3ecc7046e', 'Avery Chen', 'avery@harborops.test', 'SUPER_ADMIN', null),
  ('e69efb97-8237-4d7d-9648-0818f8cd4c10', 'Maria Lopez', 'maria@harborops.test', 'ADMIN', null),
  ('3bf09c1e-e793-4487-a68f-d044cdb279b1', 'Alex Rivera', 'alex@harborops.test', 'SERVICE_WORKER', 'Electrician'),
  ('0fd7a748-9cf1-4df7-a580-c1501741faa7', 'Mina Goose', 'mina@harborops.test', 'SERVICE_WORKER', 'Housekeeping');

insert into public.complaints (id, unit_id, building_id, status, tenant_name, tenant_contact, description, created_at)
values
  (
    '1d613953-8943-4f68-9bdf-54d885ac0010',
    'b78d7c6a-6d7f-4650-bd08-40863c19e781',
    '8f1f740a-9ebb-403f-8da9-3cffb0a0d999',
    'IN_PROGRESS',
    'Priya Patel',
    jsonb_build_object('phone', '+14155550000'),
    'Power outage in the living room and moisture near the balcony door.',
    now() - interval '6 hours'
  ),
  (
    'c2a1ee9d-46c7-4c1e-b5a3-065160236f6a',
    '0ddfb023-200e-4d7a-bcd6-4f73ad2343c9',
    '8f1f740a-9ebb-403f-8da9-3cffb0a0d999',
    'NEW',
    'Lee Wong',
    jsonb_build_object('email', 'lee.wong@example.com'),
    'AC unit dripping water onto the entryway.',
    now() - interval '2 hours'
  );

insert into public.complaint_category_links (complaint_id, category_id)
values
  ('1d613953-8943-4f68-9bdf-54d885ac0010', 'f1d49b63-69fd-4fa6-9fcf-4c4696d61c13'),
  ('1d613953-8943-4f68-9bdf-54d885ac0010', '9017b6c8-41e7-4db7-bc3b-6bb8368adf4a'),
  ('c2a1ee9d-46c7-4c1e-b5a3-065160236f6a', '619643dd-61f0-4dd8-a199-505f7ef74c77');

insert into public.complaint_assignments (id, complaint_id, worker_id, assigned_by)
values
  ('d260f5ff-7af1-43a2-89f7-4da9c0379adc', '1d613953-8943-4f68-9bdf-54d885ac0010', '3bf09c1e-e793-4487-a68f-d044cdb279b1', '5c0bec21-4a69-4dcb-86b5-a2b3ecc7046e'),
  ('3584c575-7678-48f2-9445-1e8bcbb15741', 'c2a1ee9d-46c7-4c1e-b5a3-065160236f6a', '0fd7a748-9cf1-4df7-a580-c1501741faa7', 'e69efb97-8237-4d7d-9648-0818f8cd4c10');

insert into public.complaint_status_logs (complaint_id, old_status, new_status, changed_by, changed_at, note)
values
  ('1d613953-8943-4f68-9bdf-54d885ac0010', 'NEW', 'ASSIGNED', '5c0bec21-4a69-4dcb-86b5-a2b3ecc7046e', now() - interval '5 hours', 'Assigned to electrician team'),
  ('1d613953-8943-4f68-9bdf-54d885ac0010', 'ASSIGNED', 'IN_PROGRESS', '3bf09c1e-e793-4487-a68f-d044cdb279b1', now() - interval '2 hours', 'On-site inspection started'),
  ('c2a1ee9d-46c7-4c1e-b5a3-065160236f6a', 'NEW', 'NEW', 'e69efb97-8237-4d7d-9648-0818f8cd4c10', now() - interval '2 hours', 'Ticket created');
