use async_trait::async_trait;

use crate::Result;

#[async_trait]
pub trait UseCase<I, O> {
    async fn execute(&self, input: I) -> Result<O>;
}
