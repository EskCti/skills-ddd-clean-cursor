package __GROUP__.modules.__BC__.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "__entity__s")
public class __Entity__JpaEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    protected __Entity__JpaEntity() {}

    public __Entity__JpaEntity(UUID id) {
        this.id = id;
    }

    public UUID getId() {
        return id;
    }
}
