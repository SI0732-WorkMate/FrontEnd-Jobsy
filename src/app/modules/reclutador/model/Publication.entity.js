export class Publication {
    constructor({
                    id = null,
                    employer_id = null,
                    title = '',
                    description = '',
                    requirements = '',
                    location = '',
                    salary_range = '',
                    status = 'Activa',
                    created_at = new Date().toISOString()
                } = {}) {
        this.id = id;
        this.employer_id = employer_id;
        this.title = title;
        this.description = description;
        this.requirements = requirements;
        this.location = location;
        this.salary_range = salary_range;
        this.status = status;
        this.created_at = created_at;
    }
}
