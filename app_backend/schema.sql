CREATE TABLE endpoints (
    id serial PRIMARY KEY,
    endpoint text NOT NULL UNIQUE,   
);

CREATE TABLE requests (
  id serial PRIMARY KEY,
  request_method text NOT NULL,
  request_url text NOT NULL,
  time_created text NOT NULL,
  mongo_doc_id text NOT NULL,
  endpoint_id integer REFERENCES endpoints(id) ON DELETE CASCADE
);