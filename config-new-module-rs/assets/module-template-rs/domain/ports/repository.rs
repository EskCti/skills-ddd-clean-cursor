use async_trait::async_trait;
use shared_kernel::{EntityId, Result};

use crate::modules::__BC__::domain::__Entity__;

#[async_trait]
pub trait __Entity__Repository: Send + Sync {
    async fn save(&self, entity: &__Entity__) -> Result<()>;
    async fn find_by_id(&self, id: EntityId) -> Result<Option<__Entity__>>;
}
