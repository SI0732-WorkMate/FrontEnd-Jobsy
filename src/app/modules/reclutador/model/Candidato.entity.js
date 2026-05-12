/**
 * Candidato
 * @description Represents a candidate entity with essential information such as name, publication number,
 *              resume file, and application status (possible or denied).
 */
export class Candidato {
    /**
     * Creates a new Candidato instance.
     * @param {number} id - Unique identifier for the candidate.
     * @param {string} name - Full name of the candidate.
     * @param {string} publicationNumber - The publication number the candidate is applying to.
     * @param {string} cv - Link or filename of the candidate's resume.
     * @param {boolean} posible - Boolean flag indicating if the candidate is considered (true) or rejected (false).
     */
    constructor(id, name, publicationNumber, cv, posible) {
        this.id = id;
        this.name = name;
        this.publicationNumber = publicationNumber;
        this.cv = cv;
        this.posible = posible;
        this.status = this.posible === true ? 'Posible' : 'Denegado'; // Status string based on 'posible'
    }

    /**
     * Creates a Candidato instance from a displayable candidate object (used in the UI).
     * @param {Object} displayableCandidato - Displayable candidate object (from UI binding).
     * @returns {Candidato} A new instance of the Candidato class.
     */
    static fromDisplayableCandidato(displayableCandidato) {
        return new Candidato(
            displayableCandidato.id,
            displayableCandidato.name,
            displayableCandidato.publicationNumber,
            displayableCandidato.cv,
            displayableCandidato.status.label === 'Posible'
        );
    }

    /**
     * Converts a Candidato instance into a displayable object for frontend use.
     * @param {Candidato} candidato - The candidate instance to transform.
     * @returns {Object} A plain object formatted for UI presentation.
     */
    static toDisplayableCandidato(candidato) {
        return {
            id: candidato.id,
            name: candidato.name,
            publicationNumber: candidato.publicationNumber,
            cv: candidato.cv,
            status: candidato.posible === true ? 'Posible' : 'Denegado',
            posible: candidato.posible
        };
    }
}
