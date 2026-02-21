/**
 * SOLUÇÃO PARA PROBLEMA DE ALUNOS NÃO APARECENDO NO MOBILE
 * 
 * Adicione estas funções no arquivo js/data.js
 */

// Adicione esta função APÓS a função offDataChange (linha ~253)

    // Force reload from Firebase (ignore cache) - útil para debug mobile
    async forceReloadFromFirebase(key) {
        console.log(`🔄 Forçando reload do Firebase para ${key}...`);
        const user = getCurrentUser();
        if (!user) {
            console.error('Usuário não autenticado');
            return [];
        }

        try {
            const path = this.getFirebasePath(key, user.uid);
            const dataRef = ref(database, path);
            const snapshot = await get(dataRef);
            
            if (!snapshot.exists()) {
                console.log(`❌ Nenhum dado encontrado em ${path}`);
                return [];
            }

            const data = snapshot.val();
            console.log(`✅ Dados carregados do Firebase (${path}):`, data);

            // Convert object to array if needed
            let processedData = data;
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                const keys = Object.keys(data);
                if (keys.every(k => !isNaN(k))) {
                    processedData = Object.values(data);
                    console.log(`📋 Convertido objeto para array:`, processedData);
                }
            }

            // Update localStorage cache
            this.setDataLocal(key, processedData);
            console.log(`💾 Cache local atualizado para ${key}`);

            return processedData;
        } catch (error) {
            console.error(`❌ Erro ao forçar reload do Firebase para ${key}:`, error);
            throw error;
        }
    },

    // Force reload students (atalho para mobile)
    async forceReloadStudents() {
        return await this.forceReloadFromFirebase(this.KEYS.STUDENTS);
    },


/**
 * ADICIONE TAMBÉM ESTAS FUNÇÕES GLOBAIS PARA DEBUG
 * Coloque no final do arquivo data.js, antes do export
 */

// Exportar funções de debug para uso global (mobile)
if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
    
    // Função global para debug mobile
    window.debugFirebase = async function() {
        console.log('=== DEBUG FIREBASE ===');
        console.log('Usuário:', getCurrentUser());
        
        try {
            console.log('Forçando reload de alunos...');
            const students = await DataManager.forceReloadStudents();
            console.log('✅ Alunos carregados:', students);
            alert(`✅ ${students.length} alunos carregados do Firebase!\n\nRecarregue a página (F5) para ver as alterações.`);
            return students;
        } catch (error) {
            console.error('❌ Erro:', error);
            alert('❌ Erro ao carregar dados: ' + error.message);
            return null;
        }
    };

    // Função para limpar cache e recarregar
    window.clearCacheAndReload = function() {
        if (confirm('Limpar cache local e recarregar dados do Firebase?')) {
            localStorage.clear();
            alert('✅ Cache limpo! Recarregando página...');
            window.location.reload();
        }
    };
}
