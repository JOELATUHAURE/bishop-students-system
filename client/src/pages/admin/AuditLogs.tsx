import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Search,
  User,
  Calendar,
  Clock,
  Download,
  Filter
} from 'lucide-react';

// Services
import { getAuditLogs } from '../../services/api';

// Components
import LoadingScreen from '../../components/ui/LoadingScreen';

// Types
type AuditLog = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
};

const AuditLogs = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch audit logs
  const { data: auditLogs, isLoading, error } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => getAuditLogs(),
  });

  // Filter audit logs
  const filteredLogs = auditLogs
    ? auditLogs.filter((log: AuditLog) => {
        const matchesSearch = 
          log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesActionType = actionTypeFilter === 'all' || log.action === actionTypeFilter;
        const matchesResourceType = resourceTypeFilter === 'all' || log.resourceType === resourceTypeFilter;
        
        const logDate = new Date(log.timestamp);
        const matchesDateRange = 
          (!dateRange.startDate || logDate >= new Date(dateRange.startDate)) &&
          (!dateRange.endDate || logDate <= new Date(dateRange.endDate + 'T23:59:59'));
        
        return matchesSearch && matchesActionType && matchesResourceType && matchesDateRange;
      })
    : [];

  // Export to CSV
  const exportToCsv = () => {
    if (!filteredLogs.length) return;
    
    const headers = ['ID', 'User', 'Action', 'Resource Type', 'Resource ID', 'Details', 'IP Address', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map((log: AuditLog) => [
        log.id,
        `"${log.userName}"`,
        log.action,
        log.resourceType,
        log.resourceId,
        `"${log.details.replace(/"/g, '""')}"`,
        log.ipAddress,
        format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique action types and resource types for filters
  const actionTypes = auditLogs 
    ? ['all', ...new Set(auditLogs.map((log: AuditLog) => log.action))]
    : ['all'];
  
  const resourceTypes = auditLogs
    ? ['all', ...new Set(auditLogs.map((log: AuditLog) => log.resourceType))]
    : ['all'];

  if (isLoading) return <LoadingScreen />;
  
  if (error) return <div className="p-4 text-red-500">{t('errors.auditLogs.load')}</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('admin.auditLogs.title')}</h1>
        <button
          onClick={exportToCsv}
          disabled={!filteredLogs.length}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          <Download className="h-4 w-4 mr-2" />
          {t('admin.auditLogs.export')}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('admin.auditLogs.search')}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={actionTypeFilter}
              onChange={(e) => setActionTypeFilter(e.target.value)}
            >
              <option value="all">{t('admin.auditLogs.allActions')}</option>
              {actionTypes.filter(type => type !== 'all').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={resourceTypeFilter}
              onChange={(e) => setResourceTypeFilter(e.target.value)}
            >
              <option value="all">{t('admin.auditLogs.allResources')}</option>
              {resourceTypes.filter(type => type !== 'all').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.auditLogs.user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.auditLogs.action')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.auditLogs.resource')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.auditLogs.timestamp')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.auditLogs.ipAddress')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.auditLogs.details')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log: AuditLog) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${log.action.toLowerCase().includes('create') ? 'bg-green-100 text-green-800' : ''}
                        ${log.action.toLowerCase().includes('update') ? 'bg-blue-100 text-blue-800' : ''}
                        ${log.action.toLowerCase().includes('delete') ? 'bg-red-100 text-red-800' : ''}
                        ${log.action.toLowerCase().includes('login') ? 'bg-purple-100 text-purple-800' : ''}
                        ${log.action.toLowerCase().includes('view') ? 'bg-gray-100 text-gray-800' : ''}
                        ${!log.action.toLowerCase().match(/(create|update|delete|login|view)/) ? 'bg-yellow-100 text-yellow-800' : ''}
                      `}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium">{log.resourceType}</div>
                        <div className="text-xs text-gray-500">{log.resourceId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          {format(new Date(log.timestamp), 'yyyy-MM-dd')}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(log.timestamp), 'HH:mm:ss')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-md truncate">
                        {log.details}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {t('admin.auditLogs.noResults')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;