import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, PieChart, Download, Calendar } from 'lucide-react';
import api from '../../services/api';

const Reports = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [exportFormat, setExportFormat] = useState('csv');

  const handleExport = async () => {
    try {
      await api.admin.exportApplications({
        format: exportFormat,
        dateRange,
      });
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('admin.reports')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Options */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Download className="h-5 w-5 mr-2" />
            {t('admin.applicationsExport')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('admin.dateRange')}
              </label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="form-input"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('admin.exportFormat')}
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="form-select mt-1"
              >
                <option value="csv">{t('admin.csv')}</option>
                <option value="pdf">{t('admin.pdf')}</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              {t('admin.exportData')}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            {t('admin.statistics')}
          </h3>
          {/* Add statistics charts here */}
        </div>
      </div>
    </div>
  );
};

export default Reports;