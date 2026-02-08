import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, GlobeAltIcon, TagIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Article } from '../../services/articleRepository';
import { imageService } from '../../services/imageService';

interface ArticlePreviewProps {
    article: Article | null;
    isOpen: boolean;
    onClose: () => void;
    onPublish: (id: string) => void;
}

export default function ArticlePreview({ article, isOpen, onClose, onPublish }: ArticlePreviewProps) {
    const [generating, setGenerating] = useState(false);
    const [publishingImg, setPublishingImg] = useState(false);
    const [generatedImageBlob, setGeneratedImageBlob] = useState<Blob | null>(null);

    if (!article) return null;

    const handleGenerateImage = async () => {
        if (!article.featured_image_prompt) {
            alert('No image prompt found. Save article re-generate.');
            return;
        }
        setGenerating(true);
        try {
            const blob = await imageService.generateImage(article.featured_image_prompt);
            setGeneratedImageBlob(blob);
        } catch (e: any) {
            console.error(e);
            alert('Image Gen Failed: ' + (e.message || JSON.stringify(e)));
        } finally {
            setGenerating(false);
        }
    };

    const handlePublishImage = async () => {
        if (!generatedImageBlob) return;
        setPublishingImg(true);
        try {
            const filename = `${article.slug}-featured-${Date.now()}.png`;
            const mediaId = await imageService.uploadToWordPress(generatedImageBlob, filename);

            if (article.wp_post_id) {
                await imageService.attachMediaToPost(article.wp_post_id, mediaId);
                alert('Success! Image published and attached to WP Post.');
            } else {
                alert(`Image uploaded to WP (Media ID: ${mediaId}). Publish article first to attach it automatically next time.`);
            }
        } catch (e: any) {
            console.error(e);
            alert('Image Publish Failed: ' + e.message);
        } finally {
            setPublishingImg(false);
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                            {/* Header */}
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-4 w-full">
                                                    Article Preview
                                                </Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                                                        onClick={onClose}
                                                    >
                                                        <span className="absolute -inset-0.5" />
                                                        <span className="sr-only">Close panel</span>
                                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="mt-8">
                                                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{article.title}</h1>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                                    <span className="flex items-center gap-1">
                                                        <TagIcon className="h-4 w-4" />
                                                        {article.primary_category?.name || 'Uncategorized'}
                                                    </span>
                                                    <span>{article.word_count} words</span>
                                                    <span>by {article.author?.display_name || 'Admin'}</span>
                                                </div>

                                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                                                    <div className="flex flex-col gap-4">
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                                                                <PhotoIcon className="h-4 w-4" />
                                                                Featured Image AI
                                                            </h4>
                                                            <p className="text-xs text-blue-700 mt-1 italic max-w-md">
                                                                "{article.featured_image_prompt}"
                                                            </p>
                                                        </div>

                                                        {/* Generated Image Preview */}
                                                        {generatedImageBlob && (
                                                            <div className="relative group rounded-lg overflow-hidden w-full max-w-sm border-2 border-primary">
                                                                <img
                                                                    src={URL.createObjectURL(generatedImageBlob)}
                                                                    alt="AI Generated Preview"
                                                                    className="w-full h-auto"
                                                                />
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <span className="text-white font-bold text-sm">Preview</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={handleGenerateImage}
                                                                disabled={generating}
                                                                className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                                                            >
                                                                {generating ? (
                                                                    <>
                                                                        <span className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent"></span>
                                                                        Generating...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <PhotoIcon className="h-4 w-4" />
                                                                        {generatedImageBlob ? 'Regenerate Image' : 'Generate Image'}
                                                                    </>
                                                                )}
                                                            </button>

                                                            {generatedImageBlob && (
                                                                <button
                                                                    onClick={handlePublishImage}
                                                                    disabled={publishingImg}
                                                                    className="text-xs bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                                                                >
                                                                    {publishingImg ? 'Uploading...' : 'Publish Image to WP'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="prose prose-blue max-w-none text-gray-600 mb-8">
                                                    {/* Ideally parse Markdown here, but simpler to dump text for preview if libraries missing */}
                                                    <div className="whitespace-pre-wrap font-sans">
                                                        {article.content_md}
                                                    </div>
                                                </div>

                                                {/* SEO Metadata Card */}
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <GlobeAltIcon className="h-4 w-4 text-primary" />
                                                        SEO Metadata
                                                    </h3>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-500 uppercase">Slug</label>
                                                            <div className="text-sm font-mono text-gray-700">{article.slug}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 uppercase">SEO Title</label>
                                                            <div className="text-sm text-gray-700">{article.seo_title || article.title}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 uppercase">Meta Description ({article.meta_description?.length || 0}/160)</label>
                                                            <div className="text-sm text-gray-700">{article.meta_description}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    type="button"
                                                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                    onClick={onClose}
                                                >
                                                    Close
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onPublish(article.id)}
                                                    disabled={article.wp_status === 'published' || article.wp_status === 'queued'}
                                                    className="inline-flex justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                                                >
                                                    {article.wp_status === 'published' ? 'Published' :
                                                        article.wp_status === 'queued' ? 'Queued' : 'Publish to WordPress'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
