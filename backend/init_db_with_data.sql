DO
$do$
BEGIN
  -- Видалення таблиць, якщо вони існують (для чистого старту)
  DROP TABLE IF EXISTS public.repairs CASCADE;
  DROP TABLE IF EXISTS public.requests CASCADE;
  DROP TABLE IF EXISTS public.workstations CASCADE;
  DROP TABLE IF EXISTS public.it_users CASCADE;
  DROP TABLE IF EXISTS public.departments CASCADE;
  DROP TABLE IF EXISTS public.workstation_statuses CASCADE;

  -- Створення таблиці відділів
  CREATE TABLE public.відділи (
    id bigint generated always as identity primary key,
    назва text not null
  );
  COMMENT ON TABLE public.відділи IS 'Відділи компанії.';

  -- Створення таблиці статусів робочих станцій
  CREATE TABLE public.статуси_робочих_станцій (
    id bigint generated always as identity primary key,
    назва text not null
  );
  COMMENT ON TABLE public.статуси_робочих_станцій IS 'Статуси робочих станцій (наприклад, Активний, В ремонті).';

  -- Створення таблиці користувачів ІТ системи
  CREATE TABLE public.it_користувачі (
    id bigint generated always as identity primary key,
    id_відділу bigint references public.відділи(id) ON DELETE SET NULL,
    ім'я text not null,
    посада text,
    логін text unique not null,
    хеш_пароля text not null
  );
  COMMENT ON TABLE public.it_користувачі IS 'Користувачі інформаційної системи.';

  -- Створення таблиці робочих станцій (АРМ)
  CREATE TABLE public.робочі_станції (
    id bigint generated always as identity primary key,
    id_відділу bigint references public.відділи(id) ON DELETE SET NULL,
    id_статусу bigint references public.статуси_робочих_станцій(id) ON DELETE SET NULL,
    назва text not null,
    процесор text,
    озу text,
    накопичувач text,
    ос text,
    дата_придбання date,
    id_поточного_користувача bigint references public.it_користувачі(id) ON DELETE SET NULL
  );
  COMMENT ON TABLE public.робочі_станції IS 'Інформація про робочі станції/комп'ютери (АРМ).';

  -- Створення таблиці заявок
  CREATE TABLE public.заявки (
    id bigint generated always as identity primary key,
    id_користувача_створив bigint references public.it_користувачі(id) ON DELETE CASCADE,
    id_робочої_станції bigint references public.робочі_станції(id) ON DELETE SET NULL,
    тип text, -- Наприклад: hardware, software, network
    опис text not null,
    статус text, -- Наприклад: Відкрита, В роботі, Закрита
    пріоритет text, -- Наприклад: Високий, Середній, Низький
    дата_створення timestamp with time zone default current_timestamp,
    дата_оновлення timestamp with time zone default current_timestamp,
    id_призначеного_виконавця bigint references public.it_користувачі(id) ON DELETE SET NULL
  );
  COMMENT ON TABLE public.заявки IS 'Заявки користувачів на ІТ-підтримку.';
  -- Додаємо тригер для автоматичного оновлення updated_at
  CREATE OR REPLACE FUNCTION public.update_дата_оновлення_column()
  RETURNS TRIGGER AS $$
  BEGIN
     NEW.дата_оновлення = NOW();
     RETURN NEW;
  END;
  $$
  language 'plpgsql';

  CREATE TRIGGER update_заявки_дата_оновлення
  BEFORE UPDATE ON public.заявки
  FOR EACH ROW
  EXECUTE FUNCTION public.update_дата_оновлення_column();

  -- Створення таблиці ремонтів
  CREATE TABLE public.ремонти (
    id bigint generated always as identity primary key,
    id_заявки bigint references public.заявки(id) ON DELETE CASCADE,
    id_призначеного_виконавця bigint references public.it_користувачі(id) ON DELETE SET NULL,
    опис text not null,
    статус text, -- Наприклад: В процесі, Завершено, Очікує запчастин
    дата_початку date,
    дата_завершення date
  );
  COMMENT ON TABLE public.ремонти IS 'Інформація про ремонти, пов'язані із заявками.';

  -- Вставка даних в відділи
  INSERT INTO public.відділи (назва) VALUES
  ('IT'),
  ('HR'),
  ('Фінанси');

  -- Вставка даних в статуси робочих станцій
  INSERT INTO public.статуси_робочих_станцій (назва) VALUES
  ('Активний'),
  ('В ремонті'),
  ('Неактивний');

  -- Вставка даних в it_користувачі
   INSERT INTO public.it_користувачі (id_відділу, ім'я, посада, логін, хеш_пароля) VALUES
   (1, 'Іван Петренко', 'Системний адміністратор', 'ipetrenko', 'pass1'),
   (1, 'Олена Коваленко', 'Інженер технічної підтримки', 'okovalenko', 'pass2'),
   (2, 'Марія Сидорова', 'Менеджер з персоналу', 'msydorova', 'pass3'),
   (3, 'Олег Мельник', 'Головний бухгалтер', 'omelnyk', 'pass4'),
   (1, 'Андрій Іванов', 'Розробник', 'aivanov', 'pass5'),
   (2, 'Наталія Кравець', 'Спеціаліст з кадрів', 'nkravets', 'pass6');

  -- Вставка даних в робочі станції
  INSERT INTO public.робочі_станції (id_відділу, id_статусу, назва, процесор, озу, накопичувач, ос, дата_придбання, id_поточного_користувача) VALUES
  (1, 1, 'IT-WS-001', 'Intel Core i7', '16GB', '512GB SSD', 'Windows 10 Pro', '2022-01-15', 1),
  (1, 1, 'IT-WS-002', 'Intel Core i5', '8GB', '256GB SSD', 'Windows 10 Pro', '2022-03-20', 2),
  (2, 1, 'HR-WS-001', 'Intel Core i5', '8GB', '256GB SSD', 'Windows 10 Pro', '2022-02-10', 3),
  (3, 1, 'FIN-WS-001', 'Intel Core i7', '16GB', '512GB SSD', 'Windows 10 Pro', '2022-01-25', 4),
  (1, 2, 'IT-WS-003', 'AMD Ryzen 5', '8GB', '1TB HDD', 'Windows 10 Home', '2021-05-01', NULL),
  (2, 1, 'HR-WS-002', 'Intel Core i3', '8GB', '256GB SSD', 'Windows 10 Pro', '2023-04-18', 6),
  (3, 1, 'FIN-WS-002', 'Intel Core i5', '16GB', '512GB SSD', 'Windows 11 Pro', '2023-06-22', 4);

 -- Вставка даних в заявки
   INSERT INTO public.заявки (id_користувача_створив, id_робочої_станції, тип, опис, статус, пріоритет, дата_створення, id_призначеного_виконавця) VALUES
   (3, 3, 'software', 'Потрібна допомога з встановленням нового ПЗ для обліку кадрів.', 'Відкрита', 'Високий', NOW() - INTERVAL '5 days', 2),
   (4, 4, 'hardware', 'Принтер у відділі фінансів не друкує.', 'В роботі', 'Середній', NOW() - INTERVAL '3 days', 1),
   (3, NULL, 'network', 'Проблеми з підключенням до корпоративної мережі.', 'Закрита', 'Низький', NOW() - INTERVAL '7 days', NULL),
   (6, 6, 'hardware', 'Повільна робота комп'ютера HR-WS-002.', 'Відкрита', 'Середній', NOW() - INTERVAL '2 days', 1),
   (4, 7, 'software', 'Не вдається оновити офісний пакет на FIN-WS-002.', 'В роботі', 'Високий', NOW() - INTERVAL '1 day', 2);

 -- Вставка даних в ремонти
   INSERT INTO public.ремонти (id_заявки, id_призначеного_виконавця, опис, статус, дата_початку, дата_завершення) VALUES
   (2, 2, 'Перевірка підключення та драйверів принтера.', 'В процесі', NOW()::date - INTERVAL '2 days', NULL),
   (3, 1, 'Діагностика мережевого підключення користувача.', 'Завершено', NOW()::date - INTERVAL '6 days', NOW()::date - INTERVAL '5 days'),
   (4, 1, 'Проведено діагностику, виявлено проблему з HDD. Потрібна заміна.', 'Очікує запчастин', NOW()::date - INTERVAL '1 day', NULL);

END
$do$; 