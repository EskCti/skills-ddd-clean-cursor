use std::net::SocketAddr;

use anyhow::Error;
use api::{router, AppState};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let settings = config::Settings::from_env()?;
    let db = sqlx::PgPool::connect(&settings.database_url).await?;

    let state = AppState { db };
    let app = router(state);

    let addr: SocketAddr = settings.bind_addr.parse()?;
    tracing::info!("listening on {addr}");

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
