use crate::EntityId;

pub trait Entity {
    fn id(&self) -> &EntityId;
}

pub type EntityId = uuid::Uuid;
