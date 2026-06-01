use shared_kernel::{Entity, EntityId, Result, DomainError};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct __Entity__ {
    id: EntityId,
    // add fields + VOs via core-entity-rs / core-value-object-rs
}

impl Entity for __Entity__ {
    fn id(&self) -> &EntityId {
        &self.id
    }
}

impl __Entity__ {
    pub fn create(id: EntityId) -> Result<Self> {
        Ok(Self { id })
    }
}
