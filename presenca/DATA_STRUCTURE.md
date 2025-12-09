# 📊 Estrutura de Dados - Referência Técnica

## Firebase Realtime Database

### Estrutura Hierárquica

```
firebase-database/
├── users/
│   ├── {uid-professor-1}/
│   │   ├── attendance_students/
│   │   │   └── [
│   │   │         {
│   │   │           "id": 1,
│   │   │           "name": "João Silva",
│   │   │           "phone": "(11) 98765-4321",
│   │   │           "currentModule": 1,
│   │   │           "enrollmentDate": "2025-12-09T10:30:00.000Z",
│   │   │           "status": "active"
│   │   │         },
│   │   │         ...
│   │   │       ]
│   │   ├── attendance_modules/
│   │   │   └── [
│   │   │         {
│   │   │           "number": 1,
│   │   │           "name": "Módulo 1",
│   │   │           "year": 2025,
│   │   │           "phases": [
│   │   │             {
│   │   │               "number": 1,
│   │   │               "name": "Fase 1",
│   │   │               "startDate": "2025-01-04",
│   │   │               "endDate": "2025-01-25",
│   │   │               "expectedClasses": 4
│   │   │             },
│   │   │             ...
│   │   │           ]
│   │   │         },
│   │   │         ...
│   │   │       ]
│   │   ├── attendance_records/
│   │   │   └── [
│   │   │         {
│   │   │           "id": 1702123456.789,
│   │   │           "studentId": 1,
│   │   │           "date": "2025-12-09",
│   │   │           "moduleNumber": 1,
│   │   │           "phaseNumber": 1,
│   │   │           "present": true,
│   │   │           "notes": "",
│   │   │           "timestamp": "2025-12-09T10:35:00.000Z"
│   │   │         },
│   │   │         ...
│   │   │       ]
│   │   └── attendance_alerts/
│   │       └── [
│   │             {
│   │               "id": 1702123789.456,
│   │               "studentId": 5,
│   │               "moduleNumber": 1,
│   │               "type": "warning",
│   │               "absenceRate": 0.28,
│   │               "generatedAt": "2025-12-09T14:20:00.000Z"
│   │             },
│   │             ...
│   │           ]
│   └── {uid-professor-2}/
│       └── ... (mesma estrutura)
```

## Tipos de Dados

### Student (Aluno)
```typescript
interface Student {
  id: number;                    // ID único gerado automaticamente
  name: string;                  // Nome completo
  phone: string;                 // Telefone com formatação
  currentModule: number;         // Módulo atual (1-4)
  enrollmentDate: string;        // ISO 8601 timestamp
  status: 'active' | 'inactive'; // Status do aluno
}
```

### Module (Módulo)
```typescript
interface Module {
  number: number;      // Número do módulo (1-4)
  name: string;        // Nome do módulo
  year: number;        // Ano letivo
  phases: Phase[];     // Array de fases
}
```

### Phase (Fase)
```typescript
interface Phase {
  number: number;           // Número da fase (1-4)
  name: string;             // Nome da fase
  startDate: string | null; // Data início (YYYY-MM-DD) ou null
  endDate: string | null;   // Data fim (YYYY-MM-DD) ou null
  expectedClasses: number;  // Número esperado de aulas (sábados)
}
```

### AttendanceRecord (Registro de Presença)
```typescript
interface AttendanceRecord {
  id: number;          // ID único (timestamp + random)
  studentId: number;   // Referência ao ID do aluno
  date: string;        // Data da aula (YYYY-MM-DD)
  moduleNumber: number; // Número do módulo
  phaseNumber: number;  // Número da fase
  present: boolean;     // true = Presente, false = Faltou
  notes: string;        // Observações (opcional)
  timestamp: string;    // ISO 8601 timestamp da marcação
}
```

### Alert (Alerta)
```typescript
interface Alert {
  id: number;           // ID único (timestamp + random)
  studentId: number;    // Referência ao ID do aluno
  moduleNumber: number; // Número do módulo
  type: 'warning' | 'critical'; // Tipo de alerta
  absenceRate: number;  // Taxa de faltas (0.0 a 1.0)
  generatedAt: string;  // ISO 8601 timestamp
}
```

## Regras de Negócio

### Cálculo de Presença

1. **Por Módulo:**
   ```javascript
   const totalAulas = attendanceRecords.filter(
     r => r.studentId === id && r.moduleNumber === moduleNum
   ).length;
   
   const presentes = attendanceRecords.filter(
     r => r.studentId === id && 
          r.moduleNumber === moduleNum && 
          r.present === true
   ).length;
   
   const percentualPresenca = (presentes / totalAulas) * 100;
   const percentualFaltas = 100 - percentualPresenca;
   ```

2. **Por Fase:**
   ```javascript
   const totalAulas = attendanceRecords.filter(
     r => r.studentId === id && 
          r.moduleNumber === moduleNum &&
          r.phaseNumber === phaseNum
   ).length;
   
   const presentes = attendanceRecords.filter(
     r => r.studentId === id && 
          r.moduleNumber === moduleNum &&
          r.phaseNumber === phaseNum &&
          r.present === true
   ).length;
   ```

### Geração de Alertas

```javascript
if (absencePercentage >= 40) {
  return {
    type: 'critical',
    color: '#a94442',
    icon: '🔴',
    message: 'CRÍTICO - Deve repetir módulo'
  };
} else if (absencePercentage >= 25) {
  return {
    type: 'warning',
    color: '#d68910',
    icon: '🟠',
    message: 'AVISO - Atenção à frequência'
  };
} else {
  return {
    type: 'ok',
    color: '#2d7a2d',
    icon: '✅',
    message: 'Regular'
  };
}
```

## Regras de Segurança Firebase

### Realtime Database Rules

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

**Explicação:**
- `"users"`: Raiz dos dados dos usuários
- `"$uid"`: Variável que captura o UID do usuário
- `".read": "$uid === auth.uid"`: Usuário só lê seus próprios dados
- `".write": "$uid === auth.uid"`: Usuário só escreve seus próprios dados

### Validações Adicionais (Opcional)

Para adicionar validações mais rigorosas:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "attendance_students": {
          ".validate": "newData.isArray()",
          "$index": {
            ".validate": "newData.hasChildren(['id', 'name', 'phone', 'currentModule'])"
          }
        },
        "attendance_records": {
          ".validate": "newData.isArray()",
          "$index": {
            ".validate": "newData.hasChildren(['id', 'studentId', 'date', 'present'])"
          }
        }
      }
    }
  }
}
```

## localStorage Keys

Para compatibilidade com versão offline:

```javascript
const KEYS = {
  STUDENTS: 'attendance_students',
  MODULES: 'attendance_modules',
  ATTENDANCE: 'attendance_records',
  ALERTS: 'attendance_alerts',
  SETTINGS: 'attendance_settings'
};
```

## Exportação de Dados

### Formato JSON Completo

```json
{
  "students": [...],
  "modules": [...],
  "attendance": [...],
  "alerts": [...],
  "exportedAt": "2025-12-09T15:30:00.000Z"
}
```

### Formato CSV (Students)

```csv
ID,Nome,Telefone,Módulo Atual,Módulo 1,Módulo 2,Módulo 3,Módulo 4
1,João Silva,(11) 98765-4321,1,85.5%,0.0%,0.0%,0.0%
2,Maria Santos,(11) 98765-1234,1,92.3%,0.0%,0.0%,0.0%
```

### Formato CSV (Attendance)

```csv
Data,Aluno,Módulo,Fase,Status
2025-12-09,João Silva,1,1,Presente
2025-12-09,Maria Santos,1,1,Faltou
```

## Performance

### Otimizações Implementadas

1. **Índices Firebase:**
   - Dados estruturados por UID para acesso direto
   - Arrays para operações em lote

2. **Caching:**
   - localStorage como backup offline
   - Dados mantidos em memória durante sessão

3. **Listeners:**
   - Uso de `onValue` para sincronização em tempo real
   - Remoção de listeners ao sair da página

## Limites Firebase (Free Tier)

- **Realtime Database:** 1 GB armazenamento
- **Autenticação:** 10.000 verificações/mês
- **Conexões simultâneas:** 100
- **Download:** 10 GB/mês

**Estimativa de Capacidade:**
- ~10.000 alunos
- ~100.000 registros de presença
- ~50 professores simultâneos
