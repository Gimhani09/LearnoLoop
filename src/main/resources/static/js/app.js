// Global variables
let allIdeas = [];
const API_URL = '/api/ideas';
let editModal, deleteModal;

// Wait for the document to be fully loaded
$(document).ready(function() {
    // Initialize Bootstrap modals
    editModal = new bootstrap.Modal(document.getElementById('editModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    
    // Load all ideas when page loads
    fetchIdeas();
    
    // Handle form submission for new ideas
    $('#ideaForm').submit(function(e) {
        e.preventDefault();
        createIdea();
    });
    
    // Handle save button click in edit modal
    $('#saveEditButton').click(function() {
        updateIdea();
    });
    
    // Handle delete confirmation
    $('#confirmDeleteButton').click(function() {
        const ideaId = $('#deleteId').val();
        deleteIdea(ideaId);
    });
    
    // Handle search input
    $('#searchInput').on('input', function() {
        filterIdeas();
    });
    
    // Handle sort options change
    $('#sortOptions').change(function() {
        sortIdeas($(this).val());
    });
    
    // Preview media upload for new idea
    $('#media').change(function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            const previewContainer = $('#mediaPreviewContainer');
            const preview = $('#mediaPreview');
            
            reader.onload = function(e) {
                preview.empty();
                previewContainer.show();
                
                if (file.type.startsWith('image/')) {
                    preview.html(`<img src="${e.target.result}" class="img-fluid rounded" style="max-height: 200px;">`);
                } else if (file.type.startsWith('video/')) {
                    preview.html(`
                        <video controls class="img-fluid rounded" style="max-height: 200px;">
                            <source src="${e.target.result}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    `);
                }
            };
            
            reader.readAsDataURL(file);
        } else {
            $('#mediaPreviewContainer').hide();
        }
    });
    
    // Preview media upload for edit form
    $('#editMedia').change(function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            const preview = $('#editMediaPreview');
            
            reader.onload = function(e) {
                preview.empty();
                
                if (file.type.startsWith('image/')) {
                    preview.html(`<img src="${e.target.result}" class="img-fluid rounded" style="max-height: 200px;">`);
                } else if (file.type.startsWith('video/')) {
                    preview.html(`
                        <video controls class="img-fluid rounded" style="max-height: 200px;">
                            <source src="${e.target.result}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    `);
                }
            };
            
            reader.readAsDataURL(file);
        }
    });
});

// Fetch all ideas from the API
function fetchIdeas() {
    $('#loading').show();
    
    $.ajax({
        url: API_URL,
        type: 'GET',
        success: function(data) {
            allIdeas = data;
            displayIdeas(allIdeas);
            $('#loading').hide();
        },
        error: function(error) {
            console.error('Error fetching ideas:', error);
            showEmptyState('Error loading ideas. Please try again later.');
            $('#loading').hide();
        }
    });
}

// Display ideas in the container
function displayIdeas(ideas) {
    const container = $('#ideasContainer');
    container.empty();
    
    if (ideas.length === 0) {
        showEmptyState('No ideas found. Be the first to share an idea!');
        return;
    }
    
    ideas.forEach(idea => {
        const formattedDate = new Date(idea.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const ideaCard = `
            <div class="col-md-6 col-lg-4 mb-4 fade-in">
                <div class="card idea-card h-100">
                    <div class="card-header bg-light">
                        <span class="card-title h5">${escapeHtml(idea.title)}</span>
                        <div class="actions-container">
                            <i class="fas fa-edit edit-btn action-btn" data-id="${idea.id}" title="Edit"></i>
                            <i class="fas fa-trash-alt delete-btn action-btn" data-id="${idea.id}" title="Delete"></i>
                        </div>
                    </div>                    <div class="card-body">
                        <p class="card-text">${escapeHtml(idea.description)}</p>
                        ${renderMedia(idea)}
                        <p class="date-display mb-0">Posted on ${formattedDate}</p>
                    </div>
                </div>
            </div>
        `;
        
        container.append(ideaCard);
    });
    
    // Add event listeners to dynamically created buttons
    $('.edit-btn').click(function() {
        const ideaId = $(this).data('id');
        openEditModal(ideaId);
    });
    
    $('.delete-btn').click(function() {
        const ideaId = $(this).data('id');
        openDeleteModal(ideaId);
    });
}

// Create a new idea
function createIdea() {
    const title = $('#title').val();
    const description = $('#description').val();
    const mediaFile = $('#media')[0].files[0];
    
    // Show loading state
    $('#loading').show();
    
    if (mediaFile) {
        // Create FormData object for file upload
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('media', mediaFile);
        
        // Use AJAX to post form data with file
        $.ajax({
            url: API_URL + '/with-media',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(data) {
                // Clear the form
                $('#ideaForm')[0].reset();
                $('#mediaPreviewContainer').hide();
                
                // Refresh ideas list
                fetchIdeas();
                
                // Show success message
                showToast('Success', 'Your idea has been shared!', 'success');
            },
            error: function(error) {
                console.error('Error creating idea:', error);
                showToast('Error', 'Failed to share your idea. Please try again.', 'danger');
                $('#loading').hide();
            }
        });
    } else {
        // Regular JSON post without media
        const idea = {
            title: title,
            description: description
        };
        
        $.ajax({
            url: API_URL,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(idea),
            success: function(data) {
                // Clear the form
                $('#ideaForm')[0].reset();
                
                // Refresh ideas list
                fetchIdeas();
                
                // Show success message
                showToast('Success', 'Your idea has been shared!', 'success');
            },
            error: function(error) {
                console.error('Error creating idea:', error);
                showToast('Error', 'Failed to share your idea. Please try again.', 'danger');
                $('#loading').hide();
            }
        });
    }
}

// Open edit modal and populate with idea data
function openEditModal(ideaId) {
    const idea = allIdeas.find(item => item.id === ideaId);
    
    if (idea) {
        $('#editId').val(idea.id);
        $('#editTitle').val(idea.title);
        $('#editDescription').val(idea.description);
        
        // Display current media if available
        const mediaPreview = $('#editMediaPreview');
        const mediaContainer = $('#editMediaPreviewContainer');
        
        if (idea.mediaUrl) {
            if (idea.mediaType === 'image') {
                mediaPreview.html(`<img src="${idea.mediaUrl}" class="img-fluid rounded" style="max-height: 200px;">`);
            } else if (idea.mediaType === 'video') {
                mediaPreview.html(`
                    <video controls class="img-fluid rounded" style="max-height: 200px;">
                        <source src="${idea.mediaUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `);
            }
            mediaContainer.show();
        } else {
            mediaContainer.hide();
        }
        
        editModal.show();
    }
}

// Update an existing idea
function updateIdea() {
    const id = $('#editId').val();
    const title = $('#editTitle').val();
    const description = $('#editDescription').val();
    const mediaFile = $('#editMedia')[0].files[0];
    
    // Show loading state
    $('#loading').show();
    
    // Close the modal
    editModal.hide();
    
    if (mediaFile) {
        // Create FormData object for file upload
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('media', mediaFile);
        
        // Use AJAX to post form data with file
        $.ajax({
            url: API_URL + '/update/' + id,
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(data) {
                // Refresh ideas list
                fetchIdeas();
                
                // Show success message
                showToast('Success', 'Your idea has been updated!', 'success');
            },
            error: function(error) {
                console.error('Error updating idea:', error);
                showToast('Error', 'Failed to update your idea. Please try again.', 'danger');
                $('#loading').hide();
            }
        });
    } else {
        // Regular JSON put without media
        const idea = {
            title: title,
            description: description
        };
        
        $.ajax({
            url: API_URL + '/' + id,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(idea),
            success: function(data) {
                // Refresh ideas list
                fetchIdeas();
                
                // Show success message
                showToast('Success', 'Your idea has been updated!', 'success');
            },
            error: function(error) {
                console.error('Error updating idea:', error);
                showToast('Error', 'Failed to update your idea. Please try again.', 'danger');
                $('#loading').hide();
            }
        });
    }
}

// Open delete confirmation modal
function openDeleteModal(ideaId) {
    $('#deleteId').val(ideaId);
    deleteModal.show();
}

// Delete an idea
function deleteIdea(ideaId) {
    $.ajax({
        url: `${API_URL}/${ideaId}`,
        type: 'DELETE',
        success: function() {
            // Remove idea from array
            allIdeas = allIdeas.filter(item => item.id !== ideaId);
            
            // Re-display ideas and hide modal
            displayIdeas(allIdeas);
            deleteModal.hide();
            
            createToast('Success', 'Idea deleted successfully!', 'success');
        },
        error: function(error) {
            console.error('Error deleting idea:', error);
            createToast('Error', 'Failed to delete idea. Please try again.', 'danger');
            deleteModal.hide();
        }
    });
}

// Filter ideas based on search input
function filterIdeas() {
    const searchTerm = $('#searchInput').val().toLowerCase();
    
    if (!searchTerm) {
        displayIdeas(allIdeas);
        return;
    }
    
    const filteredIdeas = allIdeas.filter(idea => 
        idea.title.toLowerCase().includes(searchTerm) || 
        idea.description.toLowerCase().includes(searchTerm)
    );
    
    displayIdeas(filteredIdeas);
}

// Sort ideas based on selected option
function sortIdeas(sortOption) {
    let sortedIdeas = [...allIdeas];
    
    switch(sortOption) {
        case 'newest':
            sortedIdeas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            sortedIdeas.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'titleAZ':
            sortedIdeas.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'titleZA':
            sortedIdeas.sort((a, b) => b.title.localeCompare(a.title));
            break;
        default:
            sortedIdeas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    displayIdeas(sortedIdeas);
}

// Show empty state message
function showEmptyState(message) {
    const container = $('#ideasContainer');
    container.html(`
        <div class="col-12 empty-state">
            <i class="fas fa-lightbulb"></i>
            <h4>No Ideas Found</h4>
            <p>${message}</p>
        </div>
    `);
}

// Create toast notification
function createToast(title, message, type) {
    // Check if toast container exists, if not create it
    if ($('.toast-container').length === 0) {
        $('body').append('<div class="toast-container"></div>');
    }
    
    // Create toast with unique ID
    const toastId = 'toast-' + Date.now();
    const toast = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" id="${toastId}">
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    $('.toast-container').append(toast);
    
    // Initialize and show the toast
    const toastElement = new bootstrap.Toast(document.getElementById(toastId), { 
        autohide: true,
        delay: 3000
    });
    toastElement.show();
    
    // Remove toast from DOM after it's hidden
    $(`#${toastId}`).on('hidden.bs.toast', function() {
        $(this).remove();
    });
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Render media function
function renderMedia(idea) {
    if (!idea.mediaUrl) {
        return '';
    }
    
    if (idea.mediaType === 'image') {
        return `
            <div class="media-container mb-3">
                <img src="${idea.mediaUrl}" class="img-fluid rounded" alt="Image for ${escapeHtml(idea.title)}" 
                     onclick="window.open('${idea.mediaUrl}', '_blank')" style="cursor: pointer; max-height: 200px;">
            </div>
        `;
    } else if (idea.mediaType === 'video') {
        return `
            <div class="media-container mb-3">
                <video controls class="img-fluid rounded" style="max-height: 200px;">
                    <source src="${idea.mediaUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
    }
    
    return '';
}
