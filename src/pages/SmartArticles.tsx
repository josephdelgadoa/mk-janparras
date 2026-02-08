import { useEffect, useState, useCallback } from 'react';
import { articleRepository, Article } from '../services/articleRepository';
import ArticlePreview from '../components/SmartArticles/ArticlePreview';
import NewArticleWizard from '../components/SmartArticles/NewArticleWizard';
import {
    ArrowPathIcon,
    CheckCircleIcon,
    ClockIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';

export default function SmartArticles() {
    const [viewMode, setViewMode] = useState<'list' | 'wizard'>('list');
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [searchText, setSearchText] = useState('');

    // Preview
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [artParams, cats] = await Promise.all([
                articleRepository.fetchArticles({
                    status: statusFilter,
                    category_id: categoryFilter,
                    search: searchText
                }),
                articleRepository.fetchCategories()
            ]);
            setArticles(artParams);
            setCategories(cats);
        } catch (error) {
            console.error('Failed to load articles', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, categoryFilter, searchText]); // Debounce search in real app

    useEffect(() => {
        if (viewMode === 'list') {
            loadData();
        }
    }, [loadData, viewMode]);

    const handlePreview = (article: Article) => {
        setSelectedArticle(article);
        setShowPreview(true);
    };

    const handlePublish = async (id: string) => {
        if (!window.confirm('Are you sure you want to queue this article for WordPress publishing?')) return;
        try {
            await articleRepository.publishToWordPress(id);
            // Alert handled in repository
            loadData();
            setShowPreview(false);
        } catch (error) {
            console.error('Publish failed', error);
            // Error alert handled in repository
        }
    };

    // Derived Stats
    const stats = {
        total: articles.length,
        published: articles.filter(a => a.status === 'published').length,
        drafts: articles.filter(a => a.status === 'draft').length,
        wp_synced: articles.filter(a => a.wp_status === 'published').length
    };

    if (viewMode === 'wizard') {
        return (
            <NewArticleWizard
                onBack={() => setViewMode('list')}
                onComplete={() => {
                    setViewMode('list');
                    loadData();
                }}
            />
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight font-serif">
                        Smart Articles
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage, optimize, and publish content to WordPress.
                    </p>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
                    <button onClick={loadData} className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        <ArrowPathIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Refresh
                    </button>
                    <button
                        onClick={() => setViewMode('wizard')}
                        className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        <PencilSquareIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        Generate New
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
                    <dt className="truncate text-sm font-medium text-gray-500">Total Articles</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.total}</dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
                    <dt className="truncate text-sm font-medium text-gray-500">Published (DB)</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600">{stats.published}</dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
                    <dt className="truncate text-sm font-medium text-gray-500">Drafts</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-indigo-600">{stats.drafts}</dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
                    <dt className="truncate text-sm font-medium text-gray-500">On WordPress</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-blue-600">{stats.wp_synced}</dd>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-3"
                        placeholder="Search articles..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="block w-full md:w-64 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                >
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full md:w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                >
                    <option value="All">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SEO / Words</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">WP Sync</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-gray-500">Loading articles...</td>
                                </tr>
                            ) : articles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-gray-500">No articles found.</td>
                                </tr>
                            ) : (
                                articles.map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 max-w-md overflow-hidden text-ellipsis">
                                            {article.title}
                                            <div className="text-xs text-gray-400 font-normal mt-0.5">{article.slug}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                {article.primary_category?.name}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {article.status === 'published' ? (
                                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Published</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Draft</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            <div>{article.word_count} words</div>
                                            <div className="text-xs text-green-600 font-medium">SEO: Good</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {article.wp_status === 'published' ? (
                                                <span className="inline-flex items-center gap-1 text-green-600">
                                                    <CheckCircleIcon className="h-4 w-4" /> Live
                                                </span>
                                            ) : article.wp_status === 'queued' ? (
                                                <span className="inline-flex items-center gap-1 text-blue-600">
                                                    <ClockIcon className="h-4 w-4" /> Queued
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Not Synced</span>
                                            )}
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <button
                                                onClick={() => handlePreview(article)}
                                                className="text-primary hover:text-primary-dark"
                                            >
                                                Preview<span className="sr-only">, {article.title}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ArticlePreview
                article={selectedArticle}
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                onPublish={handlePublish}
            />
        </div>
    );
}
