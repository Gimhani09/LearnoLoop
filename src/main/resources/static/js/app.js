// Global variables
let allIdeas = [];
const BASE_URL = window.location.origin;
const API_URL = `${BASE_URL}/api/ideas`;
const COMMENTS_API_URL = `${BASE_URL}/api/comments`;
let editModal, deleteModal;

// Wait for the document to be fully loaded
$(document).ready(function() {
    // Initialize Bootstrap modals
    editModal = new bootstrap.Modal(document.getElementById('editModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    
    // Load all ideas when page loads
    fetchIdeas();
    
    // Initialize like buttons based on localStorage
    initializeLikeButtons();
    
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
                        ${renderMedia(idea)}                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <div class="likes-container">                                <button class="btn btn-sm btn-outline-primary like-btn" data-id="${idea.id}">
                                    <i class="fas fa-thumbs-up"></i> Like
                                </button>
                                <span class="ms-2 likes-count" data-id="${idea.id}">
                                    <i class="fas fa-heart text-danger"></i> 
                                    <strong>${idea.likesCount || 0}</strong> likes
                                </span>
                            </div>
                            <p class="date-display mb-0">Posted on ${formattedDate}</p>
                        </div>                        <hr>
                        <!-- Comments Section -->
                        <div class="comments-section">                            <h6 class="comment-toggle" role="button" data-id="${idea.id}" style="cursor: pointer;">
                                <i class="fas fa-comments"></i> Comments 
                                <span class="badge bg-secondary comment-count" data-id="${idea.id}">0</span>
                                <i class="fas fa-chevron-down ms-2"></i>
                            </h6>
                            <div class="comments-wrapper" data-id="${idea.id}" style="display: none;">
                                <div class="comments-container" data-id="${idea.id}">
                                    <!-- Comments will be loaded here -->
                                    <div class="text-center my-2 comments-loading">
                                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                </div>
                                <form class="comment-form mt-2">
                                    <div class="input-group">
                                        <input type="text" class="form-control comment-input" placeholder="Add a comment..." required>
                                        <button class="btn btn-outline-primary add-comment-btn" type="submit" data-id="${idea.id}">
                                            <i class="fas fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
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
      // Add event listener for like button
    $('.like-btn').click(function() {
        const ideaId = $(this).data('id');
        likeIdea(ideaId);
    });    // We need to delegate the event handler since the form is dynamically created
    $(document).on('submit', '.comment-form', function(e) {
        e.preventDefault();
        const ideaId = $(this).find('.add-comment-btn').data('id');
        const commentInput = $(this).find('.comment-input');
        const commentText = commentInput.val().trim();
        
        console.log(`Comment form submitted for idea ${ideaId}, text: "${commentText}"`);
        
        if (commentText) {
            console.log('Comment text is not empty, adding comment...');
            addComment(ideaId, commentText);
            commentInput.val(''); // Clear input after submission
        } else {
            console.log('Comment text is empty, not adding comment');
            showToast('Warning', 'Please enter a comment before submitting', 'warning');
        }
    });// Add event handler for comment toggle
    $(document).on('click', '.comment-toggle', function() {
        const ideaId = $(this).data('id');
        console.log(`Comment toggle clicked for idea ${ideaId}`);
        
        // Toggle visibility of comments section
        const commentsWrapper = $(`.comments-wrapper[data-id="${ideaId}"]`);
        commentsWrapper.slideToggle();
        console.log(`Comments wrapper visibility toggled, now: ${commentsWrapper.is(':visible') ? 'visible' : 'hidden'}`);
        
        // Toggle the chevron icon
        const chevron = $(this).find('.fas.fa-chevron-down, .fas.fa-chevron-up');
        chevron.toggleClass('fa-chevron-down fa-chevron-up');
        
        // Load comments if not already loaded
        if (!$(`.comments-container[data-id="${ideaId}"]`).hasClass('loaded')) {
            console.log(`Comments for idea ${ideaId} not yet loaded, fetching now...`);
            fetchComments(ideaId);
            $(`.comments-container[data-id="${ideaId}"]`).addClass('loaded');
        } else {
            console.log(`Comments for idea ${ideaId} were already loaded`);
        }
    });// Initialize like buttons based on localStorage
    initializeLikeButtons();
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
        case 'mostLiked':
            sortedIdeas.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
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

// Initialize like buttons based on localStorage
function initializeLikeButtons() {
    // This will be called after ideas are loaded
    setTimeout(() => {
        allIdeas.forEach(idea => {
            const likeKey = `liked_${idea.id}`;
            const isLiked = localStorage.getItem(likeKey) === 'true';
            const likeButton = $(`.like-btn[data-id="${idea.id}"]`);
            
            if (isLiked) {
                likeButton.addClass('liked');
                likeButton.html('<i class="fas fa-thumbs-up"></i> Unlike');
            }
        });
    }, 500); // Small delay to ensure DOM is updated
}

// Get comment count for an idea
function getCommentCount(ideaId) {
    $.ajax({
        url: `${COMMENTS_API_URL}/count/idea/${ideaId}`,
        type: 'GET',
        success: function(data) {
            // Update the comment count in the UI
            $(`.comment-count[data-id="${ideaId}"]`).text(data.count || 0);
        },
        error: function(error) {
            console.error('Error getting comment count:', error);
        }
    });
}

// Function to handle liking an idea
function likeIdea(id) {
    // Check if the idea has already been liked by this user in this session
    const likeKey = `liked_${id}`;
    const isLiked = localStorage.getItem(likeKey) === 'true';
    
    // URL for like or unlike action
    const url = isLiked ? `${API_URL}/${id}/unlike` : `${API_URL}/${id}/like`;
    
    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        success: function(data) {
            // Update the like count in the UI without full refresh
            const likesCountElement = $(`.likes-count[data-id="${id}"]`);
            const likeButton = $(`.like-btn[data-id="${id}"]`);
            
            if (isLiked) {
                // User is unliking
                localStorage.removeItem(likeKey);
                likeButton.removeClass('liked');
                likeButton.html('<i class="fas fa-thumbs-up"></i> Like');
                showToast('Success', 'You unliked this idea', 'info');
            } else {                // User is liking
                localStorage.setItem(likeKey, 'true');
                likeButton.addClass('liked');
                likeButton.html('<i class="fas fa-thumbs-up"></i> Unlike');
                // Add animation class for heart beat effect
                likesCountElement.addClass('like-animation');
                // Remove animation class after animation completes
                setTimeout(() => likesCountElement.removeClass('like-animation'), 1000);
                showToast('Success', 'You liked this idea', 'success');
            }
              // Update the likes count with enhanced formatting
            likesCountElement.html(`
                <i class="fas fa-heart text-danger"></i> 
                <strong>${data.likesCount}</strong> likes
            `);
            
            // Update the idea in our local array
            const ideaIndex = allIdeas.findIndex(idea => idea.id === id);
            if (ideaIndex !== -1) {
                allIdeas[ideaIndex].likesCount = data.likesCount;
            }
        },        error: function(error) {
            console.error('Error liking/unliking idea:', error);
            showToast('Error', 'Failed to update like status. Please try again.', 'danger');
        }
    });
}    // Fetch comments for a specific idea
function fetchComments(ideaId) {
    const commentsContainer = $(`.comments-container[data-id="${ideaId}"]`);
    const loadingSpinner = commentsContainer.find('.comments-loading');
    
    console.log(`Fetching comments for idea ${ideaId} from ${COMMENTS_API_URL}/idea/${ideaId}`);
    loadingSpinner.show();
    
    $.ajax({
        url: `${COMMENTS_API_URL}/idea/${ideaId}`,
        type: 'GET',
        success: function(comments) {
            console.log(`Received ${comments.length} comments for idea ${ideaId}`);
            loadingSpinner.hide();
            
            // Update comment count badge
            $(`.comment-count[data-id="${ideaId}"]`).text(comments.length);
            
            if (comments.length === 0) {
                commentsContainer.append('<p class="text-muted small no-comments">No comments yet. Be the first to comment!</p>');
                return;
            }
            
            // Clear any "no comments" message
            commentsContainer.find('.no-comments').remove();
            
            // Display comments
            comments.forEach(comment => {
                displayComment(commentsContainer, comment);
            });
        },        error: function(error) {
            console.error('Error fetching comments:', error);
            console.error(`Status code: ${error.status}, Status text: ${error.statusText}`);
            loadingSpinner.hide();
            commentsContainer.append('<p class="text-danger small">Failed to load comments. Please refresh and try again.</p>');
            showToast('Error', 'Failed to load comments. Please try again.', 'danger');
        }
    });
}

// Display a single comment
function displayComment(container, comment) {
    // Check if comment already exists to avoid duplicates
    if (container.find(`[data-comment-id="${comment.id}"]`).length > 0) {
        return;
    }
    
    const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const commentHTML = `
        <div class="comment fade-in mb-2" data-comment-id="${comment.id}">
            <div class="d-flex justify-content-between">
                <strong class="comment-author">${escapeHtml(comment.author || 'Anonymous')}</strong>
                <small class="text-muted">${formattedDate}</small>
            </div>
            <p class="comment-content mb-1">${escapeHtml(comment.content)}</p>
            <div class="comment-actions small">
                <a href="#" class="text-danger delete-comment-link" data-id="${comment.id}">Delete</a>
            </div>
            <hr class="mt-2 mb-2">
        </div>
    `;
    
    container.append(commentHTML);
    
    // Add event listener for delete comment link
    container.find(`.delete-comment-link[data-id="${comment.id}"]`).click(function(e) {
        e.preventDefault();
        const commentId = $(this).data('id');
        deleteComment(commentId);
    });
}    // Add a new comment
function addComment(ideaId, content) {
    // Simple username input - in a real app, you'd have proper user authentication
    const author = prompt('Enter your name (or leave empty for "Anonymous"):', '');
    
    const comment = {
        ideaId: ideaId,
        content: content,
        author: author || 'Anonymous'
    };
    
    console.log(`Adding comment to idea ${ideaId} at ${COMMENTS_API_URL}/idea/${ideaId}`, comment);
    
    $.ajax({
        url: `${COMMENTS_API_URL}/idea/${ideaId}`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(comment),
        success: function(newComment) {
            const commentsContainer = $(`.comments-container[data-id="${ideaId}"]`);
            
            // Remove "no comments" message if present
            commentsContainer.find('.no-comments').remove();
            
            // Display the new comment
            displayComment(commentsContainer, newComment);
            
            // Update comment count
            const currentCount = parseInt($(`.comment-count[data-id="${ideaId}"]`).text()) || 0;
            $(`.comment-count[data-id="${ideaId}"]`).text(currentCount + 1);
            
            showToast('Success', 'Your comment has been added!', 'success');
        },        error: function(error) {
            console.error('Error adding comment:', error);
            console.error(`Status code: ${error.status}, Status text: ${error.statusText}`);
            console.error(`Response text: ${error.responseText || 'No response text'}`);
            showToast('Error', 'Failed to add your comment. Please try again.', 'danger');
        }
    });
}

// Delete a comment
// Function to show toast notifications
function showToast(title, message, type) {
    // Create toast container if it doesn't exist
    if ($('#toast-container').length === 0) {
        $('body').append('<div id="toast-container" class="position-fixed bottom-0 end-0 p-3" style="z-index: 5"></div>');
    }
    
    // Generate a unique ID for the toast
    const toastId = 'toast-' + new Date().getTime();
    
    // Create toast HTML
    const toast = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-${type} text-white">
            <strong class="me-auto">${title}</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    </div>
    `;
    
    // Add toast to container
    $('#toast-container').append(toast);
    
    // Initialize and show the toast
    const toastElement = new bootstrap.Toast(document.getElementById(toastId), {
        autohide: true,
        delay: 3000
    });
    toastElement.show();
    
    // Remove toast element after it's hidden
    $(`#${toastId}`).on('hidden.bs.toast', function() {
        $(this).remove();
    });
}

function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }
    
    $.ajax({
        url: `${COMMENTS_API_URL}/${commentId}`,
        type: 'DELETE',
        success: function(response) {
            // Remove the comment from the DOM
            const commentElement = $(`[data-comment-id="${commentId}"]`);
            const ideaId = commentElement.closest('.comments-container').data('id');
            
            commentElement.fadeOut(300, function() {
                $(this).remove();
                
                // Update comment count
                const currentCount = parseInt($(`.comment-count[data-id="${ideaId}"]`).text()) || 0;
                $(`.comment-count[data-id="${ideaId}"]`).text(Math.max(0, currentCount - 1));
                
                // Show "no comments" message if this was the last comment
                const commentsContainer = $(`.comments-container[data-id="${ideaId}"]`);
                if (commentsContainer.children('.comment').length === 0) {
                    commentsContainer.append('<p class="text-muted small no-comments">No comments yet. Be the first to comment!</p>');
                }
            });
            
            showToast('Success', 'Comment deleted successfully', 'success');
        },
        error: function(error) {
            console.error('Error deleting comment:', error);
            showToast('Error', 'Failed to delete comment. Please try again.', 'danger');
        }
    });
}
