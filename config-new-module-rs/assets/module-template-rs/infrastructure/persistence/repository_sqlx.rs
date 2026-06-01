use async_trait::async_trait;
use shared_kernel::{EntityId, Result};
use sqlx::PgPool;

use crate::domain::__Entity__;
use crate::domain::ports::__Entity__Repository;

pub struct __Entity__RepositorySqlx {
    pool: PgPool,
}

impl __Entity__RepositorySqlx {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl __Entity__Repository for __Entity__RepositorySqlx {
    async fn save(&self, _entity: &__Entity__) -> Result<()> {
        let _ = &self.pool;
        todo!("implement via backend-data-rs")
    }

    async fn find_by_id(&self, _id: EntityId) -> Result<Option<__Entity__>> {
        todo!("implement via backend-data-rs")
    }
}
