use crate::DomainError;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Result<T, E = DomainError> {
    Ok(T),
    Err(E),
}

impl<T, E> Result<T, E> {
    pub fn ok(value: T) -> Self {
        Self::Ok(value)
    }

    pub fn err(error: E) -> Self {
        Self::Err(error)
    }

    pub fn is_ok(&self) -> bool {
        matches!(self, Self::Ok(_))
    }

    pub fn is_err(&self) -> bool {
        matches!(self, Self::Err(_))
    }
}

impl<T, E: std::fmt::Display> Result<T, E> {
    pub fn map<U, F: FnOnce(T) -> U>(self, f: F) -> Result<U, E> {
        match self {
            Result::Ok(v) => Result::Ok(f(v)),
            Result::Err(e) => Result::Err(e),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn maps_ok() {
        let r: Result<i32, DomainError> = Result::ok(2);
        let mapped = r.map(|n| n + 1);
        assert!(matches!(mapped, Result::Ok(3)));
    }
}
