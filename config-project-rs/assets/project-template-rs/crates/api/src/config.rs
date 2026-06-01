use std::env;

#[derive(Debug, Clone)]
pub struct Settings {
    pub bind_addr: String,
    pub database_url: String,
}

impl Settings {
    pub fn from_env() -> Result<Self, String> {
        Ok(Self {
            bind_addr: env::var("BIND_ADDR").unwrap_or_else(|_| "0.0.0.0:4000".into()),
            database_url: env::var("DATABASE_URL")
                .map_err(|_| "DATABASE_URL is required".to_string())?,
        })
    }
}
