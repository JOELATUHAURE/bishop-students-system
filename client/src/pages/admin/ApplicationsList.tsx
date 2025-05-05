import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Search,
  Filter,
  Download,
  Calendar,
  Flag,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// Services
import { getApplications } from '../../services/api';

// Components
import LoadingScreen from '../../components/ui/LoadingScreen';

// Types
type Application = {
  id: string;
  applicantName: string;
  program: string;
  status: string;
  createdAt: string;
  lastUpdated: string;
  refugeeStatus: boolean;
  priority: 'high' | 'medium' | 'low' | null;
};

type SortField = 'applicantName' | 'program' | 'status' | 'createdAt' | 'priority';
type SortOrder = 'asc' | 'desc';

const ApplicationsList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refugeeFilter, setRefugeeFilter] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Fetch applications
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: () => getApplications(),
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Filter and sort applications
  const filteredApplications = applications
    ? applications
        .filter((app: Application) => {
          const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                app.program.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
          const matchesRefugee = refugeeFilter === null || app.refugeeStatus === refugeeFilter;
          
          return matchesSearch && matchesStatus && matchesRefugee;
        })
        .sort((a: Application, b: Application) => {
          if (sortField === 'createdAt') {
            return sortOrder === 'asc' 
              ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } else if (sortField === 'priority') {
            const priorityValue = { high: 3, medium: 2, low: 1, null: 0 };
            const aValue = a.priority ? priorityValue[a.priority] : 0;
            const bValue = b.priority ? priorityValue[b.priority] : 0;
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
          } else {
            const aValue = a[sortField].toLowerCase();
            const bValue = b[sortField].toLowerCase();
            return sortOrder === 'asc' 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }
        })
    : [];

  const exportToCsv = () => {
    if (!applications) return;
    
    const headers = ['ID', 'Applicant Name', 'Program', 'Status', 'Created Date', 'Refugee Status', 'Priority'];
    const csvContent = [
      headers.join(','),
      ...filteredApplications.map((app: Application) => [
        app.id,
        `"${app.applicantName}"`,
        `"${app.program}"`,
        app.status,
        format(new Date(app.createdAt), 'yyyy-MM-dd'),
        app.refugeeStatus ? 'Yes' : 'No',
        app.priority || 'None'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `applications-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <LoadingScreen />;
  
  if (error) return <div className="p-4 text-red-500">{t('errors.applications.load')}</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('admin.applications.title')}</h1>
        <button
          onClick={exportToCsv}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          {t('admin.applications.export')}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={t('admin.applications.search')}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="border rounded-md px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('admin.applications.filterAll')}</option>
            <option value="pending">{t('admin.applications.statusPending')}</option>
            <option value="reviewing">{t('admin.applications.statusReviewing')}</option>
            <option value="approved">{t('admin.applications.statusApproved')}</option>
            <option value="rejected">{t('admin.applications.statusRejected')}</option>
          </select>
          
          <select
            className="border rounded-md px-3 py-2"
            value={refugeeFilter === null ? 'all' : refugeeFilter ? 'yes' : 'no'}
            onChange={(e) => {
              const value = e.target.value;
              setRefugeeFilter(value === 'all' ? null : value === 'yes');
            }}
          >
            <option value="all">{t('admin.applications.allApplicants')}</option>
            <option value="yes">{t('admin.applications.refugeeOnly')}</option>
            <option value="no">{t('admin.applications.nonRefugeeOnly')}</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 border-b text-left font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center space-x-1" 
                  onClick={() => handleSort('applicantName')}
                >
                  <span>{t('admin.applications.name')}</span>
                  {getSortIcon('applicantName')}
                </button>
              </th>
              <th className="px-6 py-3 border-b text-left font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center space-x-1" 
                  onClick={() => handleSort('program')}
                >
                  <span>{t('admin.applications.program')}</span>
                  {getSortIcon('program')}
                </button>
              </th>
              <th className="px-6 py-3 border-b text-left font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center space-x-1" 
                  onClick={() => handleSort('status')}
                >
                  <span>{t('admin.applications.status')}</span>
                  {getSortIcon('status')}
                </button>
              </th>
              <th className="px-6 py-3 border-b text-left font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center space-x-1" 
                  onClick={() => handleSort('createdAt')}
                >
                  <span>{t('admin.applications.submitted')}</span>
                  {getSortIcon('createdAt')}
                </button>
              </th>
              <th className="px-6 py-3 border-b text-left font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center space-x-1" 
                  onClick={() => handleSort('priority')}
                >
                  <span>{t('admin.applications.priority')}</span>
                  {getSortIcon('priority')}
                </button>
              </th>
              <th className="px-6 py-3 border-b text-left font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.applications.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application: Application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900">{application.applicantName}</div>
                        {application.refugeeStatus && (
                          <div className="flex items-center text-sm text-blue-600">
                            <Flag className="h-4 w-4 mr-1" />
                            {t('admin.applications.refugee')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.program}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${application.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                      ${application.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${application.status === 'reviewing' ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {t(`admin.applications.status${application.status.charAt(0).toUpperCase() + application.status.slice(1)}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(application.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {application.priority ? (
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${application.priority === 'high' ? 'bg-red-100 text-red-800' : ''}
                        ${application.priority === 'medium' ? 'bg-orange-100 text-orange-800' : ''}
                        ${application.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                      `}>
                        {application.priority}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      to={`/admin/applications/${application.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {t('admin.applications.view')}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  {t('admin.applications.noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsList;