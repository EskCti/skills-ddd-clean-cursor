pub mod config;
pub mod modules;

use axum::Router;
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
}

pub fn router(state: AppState) -> Router {
    Router::new()
        .merge(modules::health::routes())
        .with_state(state)
}
