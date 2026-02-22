/**
 * SOLUÇÃO PARA PROBLEMA DE ALUNOS NÃO APARECENDO NO MOBILE
 *
 * Este arquivo é um utilitário de debug standalone.
 * Ele não deve quebrar build/lint e pode ser executado no console via import.
 */

function assertDataManager() {
    if (typeof window === 'undefined' || !window.DataManager) {
        throw new Error('DataManager não disponível em window. Abra uma página do sistema primeiro.');
    }
    return window.DataManager;
}

export async function forceReloadFromFirebase(key) {
    const dataManager = assertDataManager();
    if (typeof dataManager.forceReloadFromFirebase === 'function') {
        return dataManager.forceReloadFromFirebase(key);
    }

    throw new Error('Método forceReloadFromFirebase não existe no DataManager atual.');
}

export async function forceReloadStudents() {
    const dataManager = assertDataManager();
    if (typeof dataManager.forceReloadStudents === 'function') {
        return dataManager.forceReloadStudents();
    }

    return forceReloadFromFirebase(dataManager.KEYS.STUDENTS);
}

export async function debugFirebase() {
    console.log('=== DEBUG FIREBASE ===');

    try {
        const students = await forceReloadStudents();
        const count = Array.isArray(students) ? students.length : 0;
        console.log('✅ Alunos carregados:', students);
        return { ok: true, count, students };
    } catch (error) {
        console.error('❌ Erro no debugFirebase:', error);
        return { ok: false, error };
    }
}

export function clearCacheAndReload() {
    if (typeof window === 'undefined') return;
    localStorage.clear();
    window.location.reload();
}

if (typeof window !== 'undefined') {
    window.debugFirebase = debugFirebase;
    window.clearCacheAndReload = clearCacheAndReload;
}
