-- Create a function and trigger to insert a notification for vendors when a new review is added
-- This will notify the owner of the reviewed service

create or replace function public.fn_notify_vendor_on_review()
returns trigger
language plpgsql
security definer
as $$
declare
  vendor_user uuid;
  service_title text;
begin
  -- find the service owner
  select user_id, title into vendor_user, service_title from public.services where id = NEW.service_id;

  if vendor_user is null then
    -- nothing to do
    return NEW;
  end if;

  -- Try preferred notifications schema (notification_type/title/content)
  begin
    insert into public.notifications (user_id, notification_type, title, content, related_id, is_read, created_at)
    values (
      vendor_user,
      'review',
      format('New review for %s', coalesce(service_title,'')),
      format('You received a %s-star review: "%s"', NEW.rating::text, coalesce(NEW.comment, '')), 
      NEW.service_id,
      false,
      now()
    );
  exception when undefined_column then
    -- fallback to legacy schema with type + payload
    insert into public.notifications (user_id, type, payload, is_read, created_at)
    values (
      vendor_user,
      'review',
      jsonb_build_object('title', format('New review for %s', coalesce(service_title,'')), 'content', format('You received a %s-star review: "%s"', NEW.rating::text, coalesce(NEW.comment, '')), 'related_id', NEW.service_id),
      false,
      now()
    );
  end;

  return NEW;
end;
$$;

-- Trigger after insert on reviews
drop trigger if exists reviews_notify_vendor on public.reviews;
create trigger reviews_notify_vendor
after insert on public.reviews
for each row
execute function public.fn_notify_vendor_on_review();
