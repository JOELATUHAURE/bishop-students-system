import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { BarChart, DownloadCloud, FileText, Filter, Printer, RefreshCw } from 'lucide-react';

// Services
import { getReports } from '../../services/api';

// Components
import LoadingScreen from '../../components/ui/LoadingScreen';
import ReportCard from '../../components/admin/ReportCard';
import Select from '../../components/ui/Select';

type ReportType = 'applications' | 'admissions' | 'demographics' | 'documents';
type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

const Reports = () => {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState<ReportType>('applications');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [isExporting, setIsExporting] = useState(false);

  const { 
    data: reports, 
    isLoading, 
    isError,
    refetch 
  } = useQuery(
    ['reports', reportType, timeRange], 
    () => getReports(reportType, timeRange)
  );

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    setIsExporting(true);
    try {
      // Implement export logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Success notification would go here
    } catch (error) {
      // Error notification would go here
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t('reports.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('reports.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={() => refetch()}
            className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw size={18} className="mr-2" />
            {t('reports.refresh')}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Printer size={18} className="mr-2" />
            {t('reports.print')}
          </button>
          <div className="dropdown relative">
            <button 
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isExporting}
            >
              <DownloadCloud size={18} className={`mr-2 ${isExporting ? 'animate-bounce' : ''}`} />
              {isExporting ? t('reports.exporting') : t('reports.export')}
            </button>
            <div className="dropdown-menu hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-10">
              <button 
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <FileText size={16} className="mr-2" />
                {t('reports.exportPdf')}
              </button>
              <button 
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <FileText size={16} className="mr-2" />
                {t('reports.exportCsv')}
              </button>
              <button 
                onClick={() => handleExport('excel')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <FileText size={16} className="mr-2" />
                {t('reports.exportExcel')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 print:hidden">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('reports.reportType')}
              </label>
              <Select
                value={reportType}
                onChange={(value) => setReportType(value as ReportType)}
                options={[
                  { value: 'applications', label: t('reports.types.applications') },
                  { value: 'admissions', label: t('reports.types.admissions') },
                  { value: 'demographics', label: t('reports.types.demographics') },
                  { value: 'documents', label: t('reports.types.documents') }
                ]}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('reports.timeRange')}
              </label>
              <Select
                value={timeRange}
                onChange={(value) => setTimeRange(value as TimeRange)}
                options={[
                  { value: 'week', label: t('reports.ranges.week') },
                  { value: 'month', label: t('reports.ranges.month') },
                  { value: 'quarter', label: t('reports.ranges.quarter') },
                  { value: 'year', label: t('reports.ranges.year') },
                  { value: 'all', label: t('reports.ranges.all') }
                ]}
              />
            </div>
            <div>
              <button
                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors h-10"
              >
                <Filter size={18} className="mr-2" />
                {t('reports.filters')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-400">{t('reports.errorLoading')}</p>
          <button 
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            onClick={() => refetch()}
          >
            {t('reports.tryAgain')}
          </button>
        </div>
      ) : null}

      <div className="space-y-6">
        {/* Overview Card */}
        <ReportCard
          title={t('reports.cards.overview.title')}
          subtitle={t('reports.cards.overview.subtitle')}
          icon={<BarChart className="h-6 w-6 text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('reports.totalApplications')}
              </h3>
              <p className="text-3xl font-bold mt-2">
                {reports?.overview?.totalApplications || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {reports?.overview?.applicationChange > 0 ? '+' : ''}
                {reports?.overview?.applicationChange || 0}% {t('reports.fromPrevious')}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('reports.acceptedApplications')}
              </h3>
              <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">
                {reports?.overview?.acceptedApplications || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {(reports?.overview?.acceptedApplications / reports?.overview?.totalApplications * 100 || 0).toFixed(1)}% {t('reports.acceptanceRate')}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('reports.pendingApplications')}
              </h3>
              <p className="text-3xl font-bold mt-2 text-yellow-600 dark:text-yellow-400">
                {reports?.overview?.pendingApplications || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('reports.averageProcessingTime')}: {reports?.overview?.avgProcessingDays || 0} {t('reports.days')}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('reports.rejectedApplications')}
              </h3>
              <p className="text-3xl font-bold mt-2 text-red-600 dark:text-red-400">
                {reports?.overview?.rejectedApplications || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {(reports?.overview?.rejectedApplications / reports?.overview?.totalApplications * 100 || 0).toFixed(1)}% {t('reports.rejectionRate')}
              </p>
            </div>
          </div>
        </ReportCard>

        {/* Chart Card */}
        <ReportCard
          title={t('reports.cards.trends.title')}
          subtitle={t('reports.cards.trends.subtitle')}
          icon={<BarChart className="h-6 w-6 text-blue-600" />}
        >
          <div className="h-80 w-full">
            {/* Placeholder for chart component */}
            <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-400 dark:text-gray-500">
                {t('reports.chartPlaceholder')}
              </p>
            </div>
          </div>
        </ReportCard>

        {/* Demographics Card */}
        <ReportCard
          title={t('reports.cards.demographics.title')}
          subtitle={t('reports.cards.demographics.subtitle')}
          icon={<BarChart className="h-6 w-6 text-blue-600" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">
                {t('reports.topCountries')}
              </h3>
              <div className="space-y-2">
                {(reports?.demographics?.countries || []).map((country, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-32 font-medium">{country.name}</div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className="h-2 bg-blue-600 rounded-full" 
                          style={{ width: `${country.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm">{country.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">
                {t('reports.ageDistribution')}
              </h3>
              <div className="space-y-2">
                {(reports?.demographics?.ages || []).map((age, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-32 font-medium">{age.range}</div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className="h-2 bg-green-600 rounded-full" 
                          style={{ width: `${age.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm">{age.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ReportCard>
      </div>
    </div>
  );
};

export default Reports;