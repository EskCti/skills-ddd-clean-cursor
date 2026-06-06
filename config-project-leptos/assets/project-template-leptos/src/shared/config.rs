pub fn api_base_url() -> String {
    std::env::var("API_BASE_URL").unwrap_or_else(|_| "__API_BASE_URL__".to_string())
}
