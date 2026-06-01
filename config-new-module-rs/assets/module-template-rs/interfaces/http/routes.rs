use axum::Router;

use crate::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
    // .route("/__bc_path__", post(handlers::create))
}
