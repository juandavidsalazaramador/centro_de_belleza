// --- ESTADO INICIAL Y DATOS SEMILLA ---
const DEFAULT_SERVICES = [
    { id: 's1', name: 'Corte & Peinado Dama', category: 'Cabello', duration: 60, price: 35 },
    { id: 's2', name: 'Tinte & Colorimetría', category: 'Cabello', duration: 120, price: 75 },
    { id: 's3', name: 'Manicura Spa Rusa', category: 'Uñas', duration: 45, price: 25 },
    { id: 's4', name: 'Pedicura Spa Premium', category: 'Uñas', duration: 60, price: 30 },
    { id: 's5', name: 'Tratamiento Capilar Keratina', category: 'Cabello', duration: 90, price: 65 },
    { id: 's6', name: 'Corte Barbería & Barba', category: 'Barbería', duration: 45, price: 22 }
];

const DEFAULT_STYLISTS = [
    { id: 'e1', name: 'Valeria Gómez', spec: 'Colorimetría & Balayage', color: '#ec4899' },
    { id: 'e2', name: 'Carlos Mendoza', spec: 'Cortes Tendencia & Barbería', color: '#3b82f6' },
    { id: 'e3', name: 'Sofia Martínez', spec: 'Manicura & Nail Art', color: '#10b981' }
];

const DEFAULT_CLIENTS = [
    { id: 'c1', name: 'Elena Rostova', phone: '+57 311 4567890', email: 'elena@gmail.com', notes: 'Prefiere tinte sin amoníaco.' },
    { id: 'c2', name: 'Mariana Silva', phone: '+57 300 9876543', email: 'mariana.s@hotmail.com', notes: 'Suele pedir manicura tonos pastel.' },
    { id: 'c3', name: 'David Morales', phone: '+57 320 1122334', email: 'david@empresa.com', notes: 'Atención rápida los mediodías.' }
];

// Obtener la fecha actual en YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

const DEFAULT_APPOINTMENTS = [
    {
        id: 'a1',
        clientId: 'c1',
        stylistId: 'e1',
        serviceId: 's2',
        date: getTodayString(),
        timeStart: '10:00',
        timeEnd: '12:00',
        status: 'Programada', // Programada, En Proceso, Completada, Cancelada
        notes: 'Tinte Tono 8.1'
    },
    {
        id: 'a2',
        clientId: 'c2',
        stylistId: 'e3',
        serviceId: 's3',
        date: getTodayString(),
        timeStart: '11:00',
        timeEnd: '11:45',
        status: 'En Proceso',
        notes: ''
    }
];

// Estado en memoria respaldado por localStorage
let services = JSON.parse(localStorage.getItem('glow_services')) || DEFAULT_SERVICES;
let stylists = JSON.parse(localStorage.getItem('glow_stylists')) || DEFAULT_STYLISTS;
let clients = JSON.parse(localStorage.getItem('glow_clients')) || DEFAULT_CLIENTS;
let appointments = JSON.parse(localStorage.getItem('glow_appointments')) || DEFAULT_APPOINTMENTS;

function saveData() {
    localStorage.setItem('glow_services', JSON.stringify(services));
    localStorage.setItem('glow_stylists', JSON.stringify(stylists));
    localStorage.setItem('glow_clients', JSON.stringify(clients));
    localStorage.setItem('glow_appointments', JSON.stringify(appointments));
}

// --- SISTEMA DE NAVEGACIÓN Y VISTAS ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-rose-500/10', 'text-rose-300', 'border', 'border-rose-500/20');
        btn.classList.add('text-stone-400');
    });

    const activeView = document.getElementById(`view-${tabId}`);
    if (activeView) activeView.classList.remove('hidden');

    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) {
        activeNav.classList.add('bg-rose-500/10', 'text-rose-300', 'border', 'border-rose-500/20');
        activeNav.classList.remove('text-stone-400');
    }

    // Titulos dinámicos
    const titles = {
        'dashboard': ['Agenda de Citas', 'Gestión visual de horarios y estado del día'],
        'nueva-cita': ['Programar Cita', 'Formulario con verificación automática de disponibilidad'],
        'clientes': ['Directorio de Clientes', 'Base de datos de clientes habituales e historial'],
        'estilistas': ['Equipo de Estilistas', 'Gestión de personal y especialidades'],
        'servicios': ['Catálogo de Servicios', 'Listado de servicios, tiempos y precios']
    };

    if (titles[tabId]) {
        document.getElementById('page-title').textContent = titles[tabId][0];
        document.getElementById('page-subtitle').textContent = titles[tabId][1];
    }

    // Trigger re-renders
    if (tabId === 'dashboard') renderDashboard();
    if (tabId === 'nueva-cita') populateAppointmentSelects();
    if (tabId === 'clientes') renderClients();
    if (tabId === 'estilistas') renderStylists();
    if (tabId === 'servicios') renderServices();
}

// --- UTILIDADES DE TIEMPO Y CÁLCULOS ---
function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

// --- ALGORITMO ANTI-SOLAPAMIENTO DE CITAS ---
function checkTimeConflict() {
    const stylistId = document.getElementById('form-estilista').value;
    const serviceId = document.getElementById('form-servicio').value;
    const date = document.getElementById('form-fecha').value;
    const timeStart = document.getElementById('form-hora').value;

    const alertContainer = document.getElementById('conflict-alert');
    const btnSave = document.getElementById('btn-save-appointment');

    if (!stylistId || !serviceId || !date || !timeStart) {
        alertContainer.classList.add('hidden');
        btnSave.disabled = false;
        return;
    }

    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const startMins = timeToMinutes(timeStart);
    const endMins = startMins + parseInt(service.duration);
    const timeEnd = minutesToTime(endMins);

    // Filtrar citas del mismo estilista en la misma fecha (excluyendo canceladas)
    const stylistAppointments = appointments.filter(a => 
        a.stylistId === stylistId && 
        a.date === date && 
        a.status !== 'Cancelada'
    );

    // Validar solapamientos
    let conflict = null;
    for (let app of stylistAppointments) {
        const appStart = timeToMinutes(app.timeStart);
        const appEnd = timeToMinutes(app.timeEnd);

        // Hay solapamiento si: (NuevoInicio < ExistenteFin) Y (NuevoFin > ExistenteInicio)
        if (startMins < appEnd && endMins > appStart) {
            conflict = app;
            break;
        }
    }

    alertContainer.classList.remove('hidden');

    if (conflict) {
        const client = clients.find(c => c.id === conflict.clientId);
        const conflictServiceName = services.find(s => s.id === conflict.serviceId)?.name || 'Servicio';

        alertContainer.className = 'rounded-xl p-4 bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3';
        alertContainer.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation text-rose-500 text-lg mt-0.5"></i>
            <div>
                <h4 class="font-bold text-sm">¡Conflicto de Horario Detectado!</h4>
                <p class="text-xs mt-1">El estilista ya tiene una cita ocupada de <strong>${conflict.timeStart} a ${conflict.timeEnd}</strong> para ${client ? client.name : 'Cliente'} (${conflictServiceName}).</p>
                <p class="text-xs font-semibold mt-1">Por favor elige otra hora o cambia de estilista.</p>
            </div>
        `;
        btnSave.disabled = true;
        btnSave.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        const stylist = stylists.find(e => e.id === stylistId);
        alertContainer.className = 'rounded-xl p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start space-x-3';
        alertContainer.innerHTML = `
            <i class="fa-solid fa-circle-check text-emerald-500 text-lg mt-0.5"></i>
            <div>
                <h4 class="font-bold text-sm">Horario Disponible</h4>
                <p class="text-xs mt-1">Duración: <strong>${service.duration} mins</strong>. La cita finalizará a las <strong>${timeEnd}</strong> con ${stylist ? stylist.name : 'el estilista'}.</p>
            </div>
        `;
        btnSave.disabled = false;
        btnSave.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// --- RENDERING DASHBOARD ---
function setTodayFilter() {
    document.getElementById('filter-date').value = getTodayString();
    renderDashboard();
}

function renderDashboard() {
    const filterDate = document.getElementById('filter-date').value || getTodayString();
    document.getElementById('filter-date').value = filterDate;
    const filterStylist = document.getElementById('filter-stylist').value;

    // Formatear texto fecha
    const dateObj = new Date(filterDate + 'T00:00:00');
    const dateFormatted = dateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('date-display').textContent = dateFormatted;

    // Llenar selector estilista en filtro
    const stylistSelect = document.getElementById('filter-stylist');
    stylistSelect.innerHTML = '<option value="all">Todos los estilistas</option>' + 
        stylists.map(s => `<option value="${s.id}" ${filterStylist === s.id ? 'selected' : ''}>${s.name}</option>`).join('');

    // Filtrar Citas
    let filtered = appointments.filter(a => a.date === filterDate);
    if (filterStylist && filterStylist !== 'all') {
        filtered = filtered.filter(a => a.stylistId === filterStylist);
    }

    // Ordenar cronológicamente
    filtered.sort((a, b) => timeToMinutes(a.timeStart) - timeToMinutes(b.timeStart));

    // Calcular Métricas
    const total = filtered.length;
    const pendientes = filtered.filter(a => a.status === 'Programada').length;
    const completadas = filtered.filter(a => a.status === 'Completada').length;
    const ingresos = filtered.reduce((sum, a) => {
        if (a.status !== 'Cancelada') {
            const s = services.find(srv => srv.id === a.serviceId);
            return sum + (s ? parseInt(s.price) : 0);
        }
        return sum;
    }, 0);

    document.getElementById('stat-total-citas').textContent = total;
    document.getElementById('stat-pendientes').textContent = pendientes;
    document.getElementById('stat-completadas').textContent = completadas;
    document.getElementById('stat-ingresos').textContent = `$${ingresos}`;

    // Renderizar Lista
    const container = document.getElementById('appointments-container');
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="p-12 text-center text-stone-400 space-y-3">
                <i class="fa-regular fa-calendar-xmark text-4xl"></i>
                <p class="text-sm font-medium">No hay citas registradas para los filtros seleccionados.</p>
                <button onclick="switchTab('nueva-cita')" class="text-xs text-rose-600 font-bold hover:underline">+ Agendar nueva cita ahora</button>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(app => {
        const client = clients.find(c => c.id === app.clientId) || { name: 'Cliente Desconocido', phone: 'N/A' };
        const stylist = stylists.find(s => s.id === app.stylistId) || { name: 'Estilista', color: '#94a3b8' };
        const service = services.find(s => s.id === app.serviceId) || { name: 'Servicio', duration: 0, price: 0 };

        // Colores de estado
        const statusStyles = {
            'Programada': 'bg-amber-100 text-amber-800 border-amber-200',
            'En Proceso': 'bg-blue-100 text-blue-800 border-blue-200',
            'Completada': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'Cancelada': 'bg-stone-100 text-stone-500 border-stone-200 line-through'
        };

        return `
            <div class="p-4 sm:p-5 hover:bg-stone-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-start space-x-4">
                    <!-- Horario Block -->
                    <div class="flex flex-col items-center justify-center bg-stone-100 p-3 rounded-xl min-w-[90px] border border-stone-200">
                        <span class="font-bold text-sm text-stone-800">${app.timeStart}</span>
                        <span class="text-[10px] text-stone-500 font-medium">${app.timeEnd}</span>
                    </div>

                    <!-- Info Cita -->
                    <div class="space-y-1">
                        <div class="flex items-center space-x-2">
                            <h4 class="font-bold text-stone-900">${client.name}</h4>
                            <span class="text-xs px-2 py-0.5 rounded-full border font-semibold ${statusStyles[app.status]}">${app.status}</span>
                        </div>
                        <p class="text-xs text-stone-600 flex items-center gap-2">
                            <span class="font-medium text-rose-600">${service.name}</span>
                            <span>•</span>
                            <span>$${service.price} (${service.duration}m)</span>
                        </p>
                        <div class="flex items-center space-x-2 text-xs text-stone-500 pt-1">
                            <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${stylist.color}"></span>
                            <span>Estilista: <strong>${stylist.name}</strong></span>
                            ${app.notes ? `<span class="italic text-stone-400">("${app.notes}")</span>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Botones Acción Rápida -->
                <div class="flex items-center space-x-2 self-end md:self-center">
                    ${app.status === 'Programada' ? `
                        <button onclick="changeAppointmentStatus('${app.id}', 'En Proceso')" title="Iniciar Atención" class="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center space-x-1">
                            <i class="fa-solid fa-play"></i>
                            <span>En Proceso</span>
                        </button>
                    ` : ''}

                    ${app.status === 'En Proceso' || app.status === 'Programada' ? `
                        <button onclick="changeAppointmentStatus('${app.id}', 'Completada')" title="Marcar Completada" class="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center space-x-1">
                            <i class="fa-solid fa-check"></i>
                            <span>Completar</span>
                        </button>
                    ` : ''}

                    ${app.status !== 'Cancelada' && app.status !== 'Completada' ? `
                        <button onclick="changeAppointmentStatus('${app.id}', 'Cancelada')" title="Cancelar Cita" class="p-2 bg-stone-100 text-stone-600 hover:bg-stone-200 rounded-lg text-xs font-semibold">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    ` : ''}

                    <button onclick="deleteAppointment('${app.id}')" class="p-2 text-rose-400 hover:text-rose-600 rounded-lg text-xs">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function changeAppointmentStatus(id, newStatus) {
    const app = appointments.find(a => a.id === id);
    if (app) {
        app.status = newStatus;
        saveData();
        renderDashboard();
    }
}

function deleteAppointment(id) {
    if (confirm('¿Desea eliminar este registro de cita?')) {
        appointments = appointments.filter(a => a.id !== id);
        saveData();
        renderDashboard();
    }
}

function populateAppointmentSelects() {
    // Llenar Clientes
    const clientSelect = document.getElementById('form-cliente');
    clientSelect.innerHTML = '<option value="">-- Seleccionar Cliente --</option>' +
        clients.map(c => `<option value="${c.id}">${c.name} (${c.phone})</option>`).join('');

    // Llenar Servicios
    const serviceSelect = document.getElementById('form-servicio');
    serviceSelect.innerHTML = '<option value="">-- Seleccionar Servicio --</option>' +
        services.map(s => `<option value="${s.id}">${s.name} - $${s.price} (${s.duration} min)</option>`).join('');

    // Llenar Estilistas
    const stylistSelect = document.getElementById('form-estilista');
    stylistSelect.innerHTML = '<option value="">-- Seleccionar Estilista --</option>' +
        stylists.map(e => `<option value="${e.id}">${e.name} (${e.spec})</option>`).join('');

    // Set fecha por defecto hoy
    document.getElementById('form-fecha').value = getTodayString();
    document.getElementById('form-hora').value = '09:00';

    checkTimeConflict();
}

function handleSaveAppointment(e) {
    e.preventDefault();

    const clientId = document.getElementById('form-cliente').value;
    const serviceId = document.getElementById('form-servicio').value;
    const stylistId = document.getElementById('form-estilista').value;
    const date = document.getElementById('form-fecha').value;
    const timeStart = document.getElementById('form-hora').value;
    const notes = document.getElementById('form-notas').value;

    const service = services.find(s => s.id === serviceId);
    const startMins = timeToMinutes(timeStart);
    const timeEnd = minutesToTime(startMins + parseInt(service.duration));

    const newAppointment = {
        id: 'app_' + Date.now(),
        clientId,
        serviceId,
        stylistId,
        date,
        timeStart,
        timeEnd,
        status: 'Programada',
        notes
    };

    appointments.push(newAppointment);
    saveData();

    // Limpiar y redirigir
    document.getElementById('appointment-form').reset();
    switchTab('dashboard');
}

function renderClients() {
    const query = (document.getElementById('search-client')?.value || '').toLowerCase();
    const grid = document.getElementById('clients-grid');

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.phone.toLowerCase().includes(query)
    );

    if (filteredClients.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-stone-400 py-8 text-sm">No se encontraron clientes.</p>';
        return;
    }

    grid.innerHTML = filteredClients.map(c => {
        // Obtener historial del cliente
        const clientApps = appointments.filter(a => a.clientId === c.id);
        const totalVisits = clientApps.filter(a => a.status === 'Completada').length;

        return `
            <div class="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
                <div class="space-y-2">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center text-sm">
                                ${c.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h4 class="font-bold text-stone-800 text-base">${c.name}</h4>
                                <p class="text-xs text-stone-500">${c.phone}</p>
                            </div>
                        </div>
                        <button onclick="editClient('${c.id}')" class="text-stone-400 hover:text-stone-600 text-xs">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                    </div>

                    ${c.email ? `<p class="text-xs text-stone-600"><i class="fa-regular fa-envelope text-stone-400 mr-1.5"></i>${c.email}</p>` : ''}

                    ${c.notes ? `
                        <div class="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 text-xs text-amber-900">
                            <span class="font-semibold">Preferencia:</span> ${c.notes}
                        </div>
                    ` : ''}
                </div>

                <div class="pt-3 border-t border-stone-100 flex justify-between items-center text-xs text-stone-500">
                    <span>Visitas completadas: <strong class="text-stone-800">${totalVisits}</strong></span>
                    <button onclick="scheduleForClient('${c.id}')" class="text-rose-600 font-bold hover:underline flex items-center gap-1">
                        <span>Agendar</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function scheduleForClient(clientId) {
    switchTab('nueva-cita');
    document.getElementById('form-cliente').value = clientId;
    checkTimeConflict();
}

function openClientModal() {
    document.getElementById('modal-client-title').textContent = 'Agregar Cliente';
    document.getElementById('form-modal-client').reset();
    document.getElementById('client-id').value = '';
    document.getElementById('modal-client').classList.remove('hidden');
}

function editClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    document.getElementById('modal-client-title').textContent = 'Editar Cliente';
    document.getElementById('client-id').value = client.id;
    document.getElementById('client-name').value = client.name;
    document.getElementById('client-phone').value = client.phone;
    document.getElementById('client-email').value = client.email || '';
    document.getElementById('client-notes').value = client.notes || '';

    document.getElementById('modal-client').classList.remove('hidden');
}

function quickAddClientModal() {
    openClientModal();
}

function saveClient(e) {
    e.preventDefault();
    const id = document.getElementById('client-id').value;
    const name = document.getElementById('client-name').value;
    const phone = document.getElementById('client-phone').value;
    const email = document.getElementById('client-email').value;
    const notes = document.getElementById('client-notes').value;

    if (id) {
        const client = clients.find(c => c.id === id);
        if (client) {
            client.name = name;
            client.phone = phone;
            client.email = email;
            client.notes = notes;
        }
    } else {
        clients.push({
            id: 'c_' + Date.now(),
            name,
            phone,
            email,
            notes
        });
    }

    saveData();
    closeModal('modal-client');
    renderClients();
    populateAppointmentSelects();
}

function renderStylists() {
    const grid = document.getElementById('stylists-grid');
    grid.innerHTML = stylists.map(s => {
        const stylistApps = appointments.filter(a => a.stylistId === s.id && a.date === getTodayString() && a.status !== 'Cancelada');

        return `
            <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md" style="background-color: ${s.color}">
                        ${s.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h4 class="font-bold text-stone-800 text-lg">${s.name}</h4>
                        <p class="text-xs text-rose-600 font-semibold">${s.spec}</p>
                    </div>
                </div>

                <div class="bg-stone-50 p-3 rounded-xl border border-stone-100 space-y-1 text-xs">
                    <p class="font-bold text-stone-700">Agenda de Hoy:</p>
                    <p class="text-stone-500">${stylistApps.length} citas asignadas para el día</p>
                </div>

                <div class="pt-2 flex justify-end">
                    <button onclick="deleteStylist('${s.id}')" class="text-xs text-rose-500 hover:text-rose-700 font-medium">Eliminar Estilista</button>
                </div>
            </div>
        `;
    }).join('');
}

function openStylistModal() {
    document.getElementById('form-modal-stylist').reset();
    document.getElementById('modal-stylist').classList.remove('hidden');
}

function saveStylist(e) {
    e.preventDefault();
    const name = document.getElementById('stylist-name').value;
    const spec = document.getElementById('stylist-spec').value;
    const color = document.getElementById('stylist-color').value;

    stylists.push({
        id: 'e_' + Date.now(),
        name,
        spec,
        color
    });

    saveData();
    closeModal('modal-stylist');
    renderStylists();
    populateAppointmentSelects();
}

function deleteStylist(id) {
    if (confirm('¿Eliminar estilista?')) {
        stylists = stylists.filter(s => s.id !== id);
        saveData();
        renderStylists();
    }
}

function renderServices() {
    const tbody = document.getElementById('services-table-body');
    tbody.innerHTML = services.map(s => `
        <tr class="hover:bg-stone-50 transition-all">
            <td class="p-4 font-bold text-stone-800">${s.name}</td>
            <td class="p-4"><span class="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-semibold">${s.category}</span></td>
            <td class="p-4 text-stone-600">${s.duration} min</td>
            <td class="p-4 font-bold text-emerald-600">$${s.price}</td>
            <td class="p-4 text-right">
                <button onclick="deleteService('${s.id}')" class="text-rose-400 hover:text-rose-600 text-xs">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function openServiceModal() {
    document.getElementById('form-modal-service').reset();
    document.getElementById('modal-service').classList.remove('hidden');
}

function saveService(e) {
    e.preventDefault();
    const name = document.getElementById('service-name').value;
    const category = document.getElementById('service-category').value;
    const duration = document.getElementById('service-duration').value;
    const price = document.getElementById('service-price').value;

    services.push({
        id: 's_' + Date.now(),
        name,
        category,
        duration: parseInt(duration),
        price: parseFloat(price)
    });

    saveData();
    closeModal('modal-service');
    renderServices();
    populateAppointmentSelects();
}

function deleteService(id) {
    if (confirm('¿Desea borrar este servicio?')) {
        services = services.filter(s => s.id !== id);
        saveData();
        renderServices();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// --- INICIALIZACIÓN AL CARGAR LA PÁGINA ---
window.onload = function() {
    switchTab('dashboard');
};
