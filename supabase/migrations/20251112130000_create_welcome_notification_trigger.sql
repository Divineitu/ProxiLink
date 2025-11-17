-- Create a function and trigger to insert a welcome notification when a new profile is created
-- This ensures every newly-created user receives a welcome notification server-side

create or replace function public.fn_insert_welcome_notification()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Try inserting into the notifications table using the 'title/content/notification_type' columns.
  -- If that schema doesn't exist (older/newer migration differences), fall back to the 'type/payload' schema.
  begin
    insert into public.notifications (user_id, title, content, notification_type, is_read, created_at)
    values (
      NEW.id,
      'Welcome to ProxiLink',
      format('Welcome %s! Start exploring nearby services and providers.', coalesce(NEW.full_name, '')),
      'welcome',
      false,
      now()
    );
  exception when undefined_column then
    -- fallback: insert into type + payload (jsonb)
    insert into public.notifications (user_id, type, payload, is_read, created_at)
    values (
      NEW.id,
      'welcome',
      jsonb_build_object('title', 'Welcome to ProxiLink', 'content', format('Welcome %s! Start exploring nearby services and providers.', coalesce(NEW.full_name, '')), 'related_id', null),
      false,
      now()
    );
  end;

  return NEW;
end;
$$;

-- Trigger after insert on profiles
drop trigger if exists profiles_welcome_notification on public.profiles;
create trigger profiles_welcome_notification
after insert on public.profiles
for each row
execute function public.fn_insert_welcome_notification();
