create table if not exists "public"."users" (
    "id" serial primary key,
    "name" varchar(255) not null,
    "email" varchar(255) not null unique,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);