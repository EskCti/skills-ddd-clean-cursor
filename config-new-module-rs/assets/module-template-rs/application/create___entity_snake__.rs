use std::sync::Arc;

use async_trait::async_trait;
use shared_kernel::{Result, UseCase};

use super::dto::{Create__Entity__Input, __Entity__Output};
use crate::modules::__BC__::domain::ports::__Entity__Repository;

pub struct Create__Entity__ {
    repository: Arc<dyn __Entity__Repository>,
}

impl Create__Entity__ {
    pub fn new(repository: Arc<dyn __Entity__Repository>) -> Self {
        Self { repository }
    }
}

#[async_trait]
impl UseCase<Create__Entity__Input, __Entity__Output> for Create__Entity__ {
    async fn execute(&self, _input: Create__Entity__Input) -> Result<__Entity__Output> {
        todo!("implement via core-use-case-rs")
    }
}
