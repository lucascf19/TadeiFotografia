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
const albumCoverFileInput = document.getElementById('albumCoverFile');

// Depoimentos
const testimonialForm = document.getElementById('testimonialForm');
const testimonialCoupleNamesInput = document.getElementById('testimonialCoupleNames');
const testimonialContentInput = document.getElementById('testimonialContent');
const testimonialWeddingDateInput = document.getElementById('testimonialWeddingDate');
const testimonialPhotoInput = document.getElementById('testimonialPhoto');
const testimonialProgress = document.getElementById('testimonialProgress');
const testimonialStatus = document.getElementById('testimonialStatus');
const testimonialMessage = document.getElementById('testimonialMessage');
const testimonialError = document.getElementById('testimonialError');

// Utilitário simples
function formatDateToISO(dateStr) {
    // Garante formato YYYY-MM-DD
    if (!dateStr) return null;
    return dateStr;
}

// Compressão de imagem no cliente
async function compressImageIfPossible(file, maxWidthOrHeight, quality = 0.8) {
    if (!file || !window.imageCompression) return file;

    try {
        const options = {
            maxWidthOrHeight,
            initialQuality: quality,
            useWebWorker: true,
        };
        return await window.imageCompression(file, options);
    } catch (error) {
        console.error('Erro ao comprimir imagem no cliente, usando arquivo original.', error);
        return file;
    }
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
        const coverFile = albumCoverFileInput?.files?.[0] || null;

        if (!title || !date) {
            createAlbumError.textContent = 'Preencha título e data do álbum.';
            return;
        }

        try {
            // Primeiro cria o álbum sem capa
            const { data: albumData, error: albumError } = await supabaseClient
                .from('albums')
                .insert([{ title, date }])
                .select()
                .single();

            if (albumError) {
                console.error(albumError);
                createAlbumError.textContent = 'Erro ao criar álbum.';
                return;
            }

            // Se o usuário enviou uma capa, comprime e sobe como imagem otimizada
            if (coverFile && albumData?.id) {
                const compressedCover = await compressImageIfPossible(coverFile, 800, 0.8);
                const ext = compressedCover.name?.split('.').pop() || coverFile.name.split('.').pop();
                const safeName = title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
                const fileName = `cover-${albumData.id}-${safeName}.${ext}`;
                const filePath = `album_covers/${albumData.id}/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabaseClient
                    .storage
                    .from('photos')
                    .upload(filePath, compressedCover);

                if (uploadError) {
                    console.error(uploadError);
                } else {
                    const { data: publicData } = supabaseClient
                        .storage
                        .from('photos')
                        .getPublicUrl(uploadData.path);

                    await supabaseClient
                        .from('albums')
                        .update({ cover_url: publicData.publicUrl })
                        .eq('id', albumData.id);
                }
            }

            createAlbumMessage.textContent = 'Álbum criado com sucesso!';
            albumTitleInput.value = '';
            albumDateInput.value = '';
            if (albumCoverFileInput) albumCoverFileInput.value = '';

            // Atualiza select de álbuns
            await loadAlbumsIntoSelect();

            // Seleciona automaticamente o novo álbum no select
            if (albumData?.id) {
                albumSelect.value = String(albumData.id);
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
                // Compressão para a galeria: máx. 1600px largura, qualidade 0.8
                const compressedFile = await compressImageIfPossible(file, 1600, 0.8);

                const fileExt = compressedFile.name?.split('.').pop() || file.name.split('.').pop();
                const fileName = `${Date.now()}-${i}.${fileExt}`;
                const filePath = `${albumId}/${fileName}`;

                // Upload para bucket "photos"
                const { data: uploadData, error: uploadError } = await supabaseClient
                    .storage
                    .from('photos')
                    .upload(filePath, compressedFile);

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

// Depoimentos
if (testimonialForm && supabaseClient) {
    testimonialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        testimonialMessage.textContent = '';
        testimonialError.textContent = '';

        const coupleNames = testimonialCoupleNamesInput.value.trim();
        const content = testimonialContentInput.value.trim();
        const weddingDate = formatDateToISO(testimonialWeddingDateInput.value);
        const photoFile = testimonialPhotoInput.files?.[0] || null;

        if (!coupleNames || !content) {
            testimonialError.textContent = 'Preencha os nomes dos noivos e o texto do depoimento.';
            return;
        }

        testimonialProgress.hidden = false;
        testimonialStatus.textContent = 'Salvando depoimento...';

        try {
            let couplePhotoUrl = null;

            if (photoFile) {
                // Thumb dos noivos: limitar para 800px de largura (mais que suficiente)
                const compressedThumb = await compressImageIfPossible(photoFile, 800, 0.8);

                const ext = compressedThumb.name?.split('.').pop() || photoFile.name.split('.').pop();
                const safeName = coupleNames.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
                const fileName = `${Date.now()}-${safeName}.${ext}`;
                const filePath = `testimonials/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabaseClient
                    .storage
                    .from('photos')
                    .upload(filePath, compressedThumb);

                if (uploadError) {
                    console.error(uploadError);
                    throw new Error('Erro ao enviar a foto dos noivos.');
                }

                const { data: publicData } = supabaseClient
                    .storage
                    .from('photos')
                    .getPublicUrl(uploadData.path);

                couplePhotoUrl = publicData.publicUrl;
            }

            const payload = {
                couple_names: coupleNames,
                content,
                couple_photo_url: couplePhotoUrl,
            };

            if (weddingDate) {
                payload.wedding_date = weddingDate;
            }

            const { error } = await supabaseClient
                .from('testimonials')
                .insert([payload]);

            if (error) {
                console.error(error);
                throw new Error('Erro ao salvar o depoimento no banco de dados.');
            }

            testimonialMessage.textContent = 'Depoimento salvo com sucesso!';
            testimonialCoupleNamesInput.value = '';
            testimonialContentInput.value = '';
            testimonialWeddingDateInput.value = '';
            if (testimonialPhotoInput.value) {
                testimonialPhotoInput.value = '';
            }
        } catch (err) {
            console.error(err);
            testimonialError.textContent = err.message || 'Erro inesperado ao salvar o depoimento.';
        } finally {
            testimonialProgress.hidden = true;
        }
    });
}

// Inicialização
checkSession().catch(console.error);

