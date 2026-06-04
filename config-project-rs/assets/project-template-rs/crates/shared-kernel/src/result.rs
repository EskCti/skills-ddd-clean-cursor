use crate::DomainError;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Result<T> {
    Ok(T),
    Err(Vec<DomainError>),
}

impl<T> Result<T> {
    pub fn ok(value: T) -> Self {
        Self::Ok(value)
    }

    pub fn err(message: impl Into<String>) -> Self {
        Self::Err(vec![DomainError::new(message)])
    }

    pub fn fail(errors: Vec<DomainError>) -> Self {
        Self::Err(errors)
    }

    pub fn is_ok(&self) -> bool {
        matches!(self, Self::Ok(_))
    }

    pub fn is_err(&self) -> bool {
        matches!(self, Self::Err(_))
    }

    pub fn errors(&self) -> &[DomainError] {
        match self {
            Self::Ok(_) => &[],
            Self::Err(errors) => errors.as_slice(),
        }
    }
}

impl<T> Result<T> {
    pub fn map<U, F: FnOnce(T) -> U>(self, f: F) -> Result<U> {
        match self {
            Result::Ok(v) => Result::Ok(f(v)),
            Result::Err(errors) => Result::Err(errors),
        }
    }
}

pub fn combine_errors(results: &[Result<()>]) -> Vec<DomainError> {
    results
        .iter()
        .flat_map(|r| match r {
            Result::Err(errors) => errors.clone(),
            Result::Ok(_) => Vec::new(),
        })
        .collect()
}

pub fn combine2<T1, T2>(r1: Result<T1>, r2: Result<T2>) -> Result<(T1, T2)> {
    let mut errors = Vec::new();
    let v1 = match r1 {
        Result::Ok(v) => Some(v),
        Result::Err(e) => {
            errors.extend(e);
            None
        }
    };
    let v2 = match r2 {
        Result::Ok(v) => Some(v),
        Result::Err(e) => {
            errors.extend(e);
            None
        }
    };
    if !errors.is_empty() {
        return Result::Err(errors);
    }
    Result::Ok((v1.unwrap(), v2.unwrap()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn maps_ok() {
        let r: Result<i32> = Result::ok(2);
        let mapped = r.map(|n| n + 1);
        assert!(matches!(mapped, Result::Ok(3)));
    }

    #[test]
    fn combine_aggregates_errors() {
        let r1: Result<()> = Result::err("e1");
        let r2: Result<()> = Result::err("e2");
        let errors = combine_errors(&[r1, r2]);
        assert_eq!(errors.len(), 2);
    }
}
