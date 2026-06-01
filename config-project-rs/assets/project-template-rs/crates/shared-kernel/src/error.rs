use thiserror::Error;

#[derive(Debug, Clone, PartialEq, Eq, Error)]
#[error("{0}")]
pub struct DomainError(pub String);

impl DomainError {
    pub fn new(message: impl Into<String>) -> Self {
        Self(message.into())
    }
}

#[derive(Debug, Error)]
pub enum AppError {
    #[error("domain: {0}")]
    Domain(#[from] DomainError),
    #[error("not found")]
    NotFound,
    #[error("internal: {0}")]
    Internal(String),
}
