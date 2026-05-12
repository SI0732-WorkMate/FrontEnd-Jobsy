export function resumenSimple(texto) {
    const lowerText = texto.toLowerCase();
    let nombre = 'Nombre no encontrado';
    let habilidades = 'Habilidades no encontradas';

    const nombreMatch = texto.match(/Nombre:\s*(.*)/);
    if (nombreMatch) {
        nombre = nombreMatch[1].trim();
    }

    const habilidadesIndex = lowerText.indexOf('habilidades técnicas');
    if (habilidadesIndex !== -1) {
        habilidades = texto.substring(habilidadesIndex).split('\n').slice(1, 6).join('\n').trim();
    }

    return `**Nombre:** ${nombre}\n\n**Habilidades Técnicas:**\n${habilidades.replace(/•/g, '- ')}`;
}

export function clasificarCV(texto) {
    const lowerText = texto.toLowerCase();

    if (lowerText.includes('vue') && lowerText.includes('java')) {
        return 'APTO';
    } else if (lowerText.includes('cursando') || lowerText.includes('estudiante')) {
        return 'EN PROCESO';
    } else {
        return 'RECHAZADO';
    }
}