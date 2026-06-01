use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct Create__Entity__Input {
    // fields
}

#[derive(Debug, Serialize)]
pub struct __Entity__Output {
    pub id: Uuid,
}
