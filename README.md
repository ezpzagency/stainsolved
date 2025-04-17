# Stains

A modern PostgreSQL-based application that follows strict SQL style guidelines and best practices.

## Overview

Stains is a database-driven application that implements a robust and maintainable SQL codebase following industry best practices and strict style guidelines.

## Features

- Consistent SQL style and formatting
- Best practices for table and column naming
- Comprehensive database schema documentation
- Optimized query performance
- Clear and maintainable code structure

## SQL Style Guidelines

### General Principles

- SQL keywords in lowercase
- Descriptive identifiers for database objects
- Consistent white space and indentation
- ISO 8601 date format (`yyyy-mm-ddThh:mm:ss.sssss`)
- Comprehensive commenting

### Naming Conventions

- Snake_case for tables and columns
- Plural table names (e.g., `users`, `orders`)
- Singular column names
- No SQL reserved words
- Maximum 63 characters for identifiers

### Table Structure

- Every table has an `id` column (identity generated always)
- Tables created in `public` schema by default
- Schema explicitly specified in queries
- Table comments mandatory (max 1024 characters)

### Column Guidelines

- Singular names
- Foreign keys use `_id` suffix
- Lowercase except for acronyms

## Getting Started

1. Ensure you have PostgreSQL 15 or later installed
2. Clone this repository
3. Follow the setup instructions in the documentation
4. Review the SQL style guide before contributing

## Examples

### Basic Table Creation

```sql
create table public.users (
  id bigint generated always as identity primary key,
  username text not null,
  email text not null unique,
  created_at timestamp with time zone default now()
);
comment on table public.users is 'Stores user account information and credentials';
```

### Query Style

```sql
select
  users.username,
  orders.order_date
from
  public.users
join
  public.orders on orders.user_id = users.id
where
  orders.status = 'pending'
order by
  orders.order_date desc;
```

## Contributing

1. Follow the SQL style guide
2. Add comments for complex queries
3. Use CTEs for complex operations
4. Include table comments
5. Test queries before submitting

## License

MIT License - See LICENSE file for details

## Contact

For questions or support, please open an issue in the repository. 