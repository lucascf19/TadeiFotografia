// Configuração do Supabase (substitua pelos dados do seu projeto)
const SUPABASE_URL = 'https://qzklsvecqavpymtccawn.supabase.co'; // TODO: alterar
const SUPABASE_ANON_KEY = 'sb_publishable_7sH23dn4JVNi0MKK6USLEQ_yQPYVeD3'; // TODO: alterar

if (!window.supabase) {
    console.error('Supabase SDK não carregado. Verifique a tag de script da CDN.');
}

const supabaseClient = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const adminAuthSection = document.getElementById('adminAuthSection');
const adminPanelSection = document.getElementById('adminPanelSection');
const adminLogoutButton = document.getElementById('adminLogout');

const adminLoginForm = document.getElementById('adminLoginForm');
const adminEmailInput = document.getElementById('adminEmail');
const adminPasswordInput = document.getElementById('adminPassword');
const adminAuthError = document.getElementById('adminAuthError');

const createAlbumForm = document.getElementById('createAlbumForm');
const albumTitleInput = document.getElementById('albumTitle');
const albumDateInput = document.getElementById('albumDate');
const createAlbumMessage = document.getElementById('createAlbumMessage');
const createAlbumError = document.getElementById('createAlbumError');

const uploadPhotosForm = document.getElementById('uploadPhotosForm');
const albumSelect = document.getElementById('albumSelect');
const photoFilesInput = document.getElementById('photoFiles');
const uploadProgress = document.getElementById('uploadProgress');
const uploadStatus = document.getElementById('uploadStatus');
const uploadPhotosMessage = document.getElementById('uploadPhotosMessage');
const uploadPhotosError = document.getElementById('uploadPhotosError');

// Utilitário simples
function formatDateToISO(dateStr) {
    // Garante formato YYYY-MM-DD
    if (!dateStr) return null;
    return dateStr;
}

function setAdminState(isLoggedIn) {
    if (isLoggedIn) {
        adminAuthSection.hidden = true;
        adminPanelSection.hidden = false;
        adminLogoutButton.hidden = false;
        loadAlbumsIntoSelect();
    } else {
        adminAuthSection.hidden = false;
        adminPanelSection.hidden = true;
        adminLogoutButton.hidden = true;
    }
}

async function checkSession() {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.auth.getUser();
    setAdminState(!!data.user);
}

// Login
if (adminLoginForm && supabaseClient) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        adminAuthError.textContent = '';

        const email = adminEmailInput.value.trim();
        const password = adminPasswordInput.value.trim();

        if (!email || !password) {
            adminAuthError.textContent = 'Preencha e-mail e senha.';
            return;
        }

        try {
            const { error } = await supabaseClient.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error(error);
                adminAuthError.textContent = 'Falha no login. Verifique suas credenciais.';
                return;
            }

            setAdminState(true);
        } catch (err) {
            console.error(err);
            adminAuthError.textContent = 'Erro inesperado ao fazer login.';
        }
    });
}

// Logout
if (adminLogoutButton && supabaseClient) {
    adminLogoutButton.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        setAdminState(false);
    });
}

// Criar Álbum
if (createAlbumForm && supabaseClient) {
    createAlbumForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        createAlbumMessage.textContent = '';
        createAlbumError.textContent = '';

        const title = albumTitleInput.value.trim();
        const date = formatDateToISO(albumDateInput.value);

        if (!title || !date) {
            createAlbumError.textContent = 'Preencha título e data do álbum.';
            return;
        }

        try {
            const { data, error } = await supabaseClient
                .from('albums')
                .insert([{ title, date }])
                .select()
                .single();

            if (error) {
                console.error(error);
                createAlbumError.textContent = 'Erro ao criar álbum.';
                return;
            }

            createAlbumMessage.textContent = 'Álbum criado com sucesso!';
            albumTitleInput.value = '';
            albumDateInput.value = '';

            // Atualiza select de álbuns
            await loadAlbumsIntoSelect();

            // Seleciona automaticamente o novo álbum no select
            if (data?.id) {
                albumSelect.value = String(data.id);
            }
        } catch (err) {
            console.error(err);
            createAlbumError.textContent = 'Erro inesperado ao criar álbum.';
        }
    });
}

// Carregar álbuns no select
async function loadAlbumsIntoSelect() {
    if (!supabaseClient || !albumSelect) return;

    albumSelect.innerHTML = '<option value=\"\">Carregando álbuns...</option>';

    const { data: albums, error } = await supabaseClient
        .from('albums')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error(error);
        albumSelect.innerHTML = '<option value=\"\">Erro ao carregar álbuns</option>';
        return;
    }

    if (!albums || albums.length === 0) {
        albumSelect.innerHTML = '<option value=\"\">Nenhum álbum cadastrado</option>';
        return;
    }

    albumSelect.innerHTML = '<option value=\"\">Selecione um álbum</option>';
    albums.forEach((album) => {
        const option = document.createElement('option');
        option.value = album.id;
        const dateLabel = album.date ? ` - ${new Date(album.date).toLocaleDateString('pt-BR')}` : '';
        option.textContent = `${album.title}${dateLabel}`;
        albumSelect.appendChild(option);
    });
}

// Upload de fotos
if (uploadPhotosForm && supabaseClient) {
    uploadPhotosForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        uploadPhotosMessage.textContent = '';
        uploadPhotosError.textContent = '';

        const albumId = albumSelect.value;
        const files = Array.from(photoFilesInput.files || []);

        if (!albumId) {
            uploadPhotosError.textContent = 'Selecione um álbum.';
            return;
        }

        if (files.length === 0) {
            uploadPhotosError.textContent = 'Selecione pelo menos uma foto para enviar.';
            return;
        }

        uploadProgress.hidden = false;
        uploadStatus.textContent = 'Enviando fotos...';

        try {
            const uploadedPhotoUrls = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${i}.${fileExt}`;
                const filePath = `${albumId}/${fileName}`;

                // Upload para bucket "photos"
                const { data: uploadData, error: uploadError } = await supabaseClient
                    .storage
                    .from('photos')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error(uploadError);
                    throw new Error('Erro ao fazer upload de uma das fotos.');
                }

                // URL pública
                const { data: publicData } = supabaseClient
                    .storage
                    .from('photos')
                    .getPublicUrl(uploadData.path);

                const publicUrl = publicData.publicUrl;
                uploadedPhotoUrls.push(publicUrl);

                // Inserir na tabela photos
                const { error: insertError } = await supabaseClient
                    .from('photos')
                    .insert([{ album_id: albumId, photo_url: publicUrl }]);

                if (insertError) {
                    console.error(insertError);
                    throw new Error('Erro ao salvar foto no banco de dados.');
                }

                uploadStatus.textContent = `Enviando fotos... (${i + 1}/${files.length})`;
            }

            // Define a capa do álbum com a primeira foto enviada, se não houver ainda
            if (uploadedPhotoUrls.length > 0) {
                const { data: albumData, error: albumError } = await supabaseClient
                    .from('albums')
                    .select('cover_url')
                    .eq('id', albumId)
                    .single();

                if (!albumError && !albumData.cover_url) {
                    await supabaseClient
                        .from('albums')
                        .update({ cover_url: uploadedPhotoUrls[0] })
                        .eq('id', albumId);
                }
            }

            uploadPhotosMessage.textContent = 'Fotos enviadas com sucesso!';
            photoFilesInput.value = '';
        } catch (err) {
            console.error(err);
            uploadPhotosError.textContent = err.message || 'Erro inesperado ao enviar fotos.';
        } finally {
            uploadProgress.hidden = true;
        }
    });
}

// Inicialização
checkSession().catch(console.error);

