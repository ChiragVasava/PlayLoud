// components/pages/CreatePlaylist.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import {
    ArrowLeftIcon,
    PhotoIcon,
    EyeIcon,
    EyeSlashIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const CreatePlaylist = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPublic: false,
        coverImage: null
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [coverPreview, setCoverPreview] = useState(null);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle cover image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, coverImage: 'Please select a valid image file' }));
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, coverImage: 'Image size must be less than 5MB' }));
                return;
            }

            setFormData(prev => ({ ...prev, coverImage: file }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setCoverPreview(e.target.result);
            reader.readAsDataURL(file);

            // Clear any previous errors
            setErrors(prev => ({ ...prev, coverImage: '' }));
        }
    };

    // Remove cover image
    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, coverImage: null }));
        setCoverPreview(null);
        // Reset file input
        const fileInput = document.getElementById('coverImage');
        if (fileInput) fileInput.value = '';
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Playlist name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Playlist name must be at least 2 characters';
        } else if (formData.name.trim().length > 100) {
            newErrors.name = 'Playlist name must be less than 100 characters';
        }

        if (formData.description.length > 300) {
            newErrors.description = 'Description must be less than 300 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Creating playlist:', formData);

            // Here you would typically:
            // 1. Upload cover image to cloud storage
            // 2. Send playlist data to your API
            // 3. Add to user's playlists

            // Show success and navigate back
            alert('Playlist created successfully!');
            navigate('/library'); // Navigate back to library

        } catch (error) {
            console.error('Failed to create playlist:', error);
            setErrors({ submit: 'Failed to create playlist. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle cancel/back
    const handleCancel = () => {
        if (formData.name || formData.description || formData.coverImage) {
            const confirmed = window.confirm('Are you sure you want to cancel? Your changes will be lost.');
            if (confirmed) {
                navigate('/library');
            }
        } else {
            navigate('/library');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                    <ArrowLeftIcon className="w-6 h-6 text-gray-400 hover:text-white" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">Create Playlist</h1>
                    <p className="text-gray-400">Add a new playlist to your library</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Cover Image Section */}
                <div className="space-y-4">
                    <label className="block text-lg font-semibold text-white">
                        Cover Image <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                    </label>

                    <div className="flex items-start space-x-6">
                        {/* Image Preview */}
                        <div className="flex-shrink-0">
                            <div className="w-48 h-48 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center relative group">
                                {coverPreview ? (
                                    <>
                                        <img
                                            src={coverPreview}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <PhotoIcon className="w-16 h-16 text-gray-500 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm">Click to upload</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <input
                                    type="file"
                                    id="coverImage"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="coverImage"
                                    className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                                >
                                    Choose Image
                                </label>
                            </div>

                            <div className="text-sm text-gray-400 space-y-1">
                                <p>• Recommended size: 300x300 pixels</p>
                                <p>• Formats: JPG, PNG, GIF</p>
                                <p>• Maximum size: 5MB</p>
                            </div>

                            {errors.coverImage && (
                                <p className="text-sm text-red-400">{errors.coverImage}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-6">
                    {/* Playlist Name */}
                    <div>
                        <label htmlFor="name" className="block text-lg font-semibold text-white mb-3">
                            Playlist Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your playlist name..."
                            className={`w-full px-4 py-3 bg-gray-800 border-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${errors.name
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-600 focus:ring-green-500 focus:border-green-500'
                                }`}
                            maxLength={100}
                        />
                        <div className="flex justify-between items-center mt-2">
                            {errors.name ? (
                                <p className="text-sm text-red-400">{errors.name}</p>
                            ) : (
                                <p className="text-sm text-gray-500">Choose a name that describes your music collection</p>
                            )}
                            <span className="text-xs text-gray-500">{formData.name.length}/100</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-lg font-semibold text-white mb-3">
                            Description <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Tell people what your playlist is about..."
                            rows={4}
                            className={`w-full px-4 py-3 bg-gray-800 border-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none ${errors.description
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-600 focus:ring-green-500 focus:border-green-500'
                                }`}
                            maxLength={300}
                        />
                        <div className="flex justify-between items-center mt-2">
                            {errors.description ? (
                                <p className="text-sm text-red-400">{errors.description}</p>
                            ) : (
                                <p className="text-sm text-gray-500">Add a description to help others discover your playlist</p>
                            )}
                            <span className="text-xs text-gray-500">{formData.description.length}/300</span>
                        </div>
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                    <label className="block text-lg font-semibold text-white">
                        Privacy Settings
                    </label>

                    <div className="bg-gray-800 rounded-lg p-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${formData.isPublic ? 'bg-green-600' : 'bg-gray-600'}`}>
                                    {formData.isPublic ? (
                                        <EyeIcon className="w-5 h-5 text-white" />
                                    ) : (
                                        <EyeSlashIcon className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-white">
                                        {formData.isPublic ? 'Public Playlist' : 'Private Playlist'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {formData.isPublic
                                            ? 'Anyone can see and follow this playlist'
                                            : 'Only you can see this playlist'
                                        }
                                    </p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="isPublic"
                                checked={formData.isPublic}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                            />
                        </label>
                    </div>
                </div>

                {/* Error Message */}
                {errors.submit && (
                    <div className="bg-red-900 border border-red-600 rounded-lg p-4">
                        <p className="text-red-200">{errors.submit}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6 border-t border-gray-700">
                    <Button
                        type="button"
                        onClick={handleCancel}
                        variant="secondary"
                        size="large"
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        loading={isLoading}
                        disabled={!formData.name.trim() || isLoading}
                        className="flex-1"
                    >
                        {isLoading ? 'Creating...' : 'Create Playlist'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreatePlaylist;