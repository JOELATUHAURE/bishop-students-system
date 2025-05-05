import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  MessageSquare,
  Paperclip,
  Edit,
  Save,
  XCircle,
  FileText,
  Flag,
  User,
  BookOpen,
  Calendar
} from 'lucide-react';

// Services
import { getApplicationById, updateApplicationStatus, addComment, downloadDocument } from '../../services/api';

// Components
import LoadingScreen from '../../components/ui/LoadingScreen';

// Types
type ApplicationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';
type Priority = 'high' | 'medium' | 'low' | null;

type Document = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url: string;
};

type CommentType = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
};

type EducationRecord = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade: string;
};

type Application = {
  id: string;
  applicantId: string;
  applicantName: string;
  email: string;
  phone: string;
  program: string;
  faculty: string;
  status: ApplicationStatus;
  priority: Priority;
  refugeeStatus: boolean;
  passportNumber?: string;
  refugeeId?: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents: Document[];
  educationRecords: EducationRecord[];
  comments: CommentType[];
  createdAt: string;
  lastUpdated: string;
};

const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [newComment, setNewComment] = useState('');
  const [editingPriority, setEditingPriority] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>(null);

  // Fetch application details
  const { data: application, isLoading, error } = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplicationById(id || ''),
    enabled: !!id,
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) => 
      updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
    },
  });

  // Update priority mutation
  const updatePriorityMutation = useMutation({
    mutationFn: ({ applicationId, priority }: { applicationId: string; priority: Priority }) => 
      updateApplicationStatus(applicationId, undefined, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      setEditingPriority(false);
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: ({ applicationId, text }: { applicationId: string; text: string }) => 
      addComment(applicationId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      setNewComment('');
    },
  });

  // Handle status change
  const handleStatusChange = (status: ApplicationStatus) => {
    if (!application) return;
    updateStatusMutation.mutate({ applicationId: application.id, status });
  };

  // Handle priority save
  const handlePrioritySave = () => {
    if (!application) return;
    updatePriorityMutation.mutate({ 
      applicationId: application.id, 
      priority: selectedPriority 
    });
  };

  // Handle comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !newComment.trim()) return;
    
    addCommentMutation.mutate({ 
      applicationId: application.id, 
      text: newComment 
    });
  };

  // Handle document download
  const handleDocumentDownload = async (documentId: string) => {
    if (!application) return;
    try {
      await downloadDocument(application.id, documentId);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  if (isLoading) return <LoadingScreen />;
  
  if (error || !application) {
    return (
      <div className="p-4 text-red-500">
        {t('errors.application.load')}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            {application.applicantName}
            {application.refugeeStatus && (
              <Flag className="ml-2 h-5 w-5 text-blue-500" />
            )}
          </h1>
          <p className="text-gray-500">
            {t('admin.applicationDetails.applicationId')}: {application.id}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/admin/applications')}
            className="px-3 py-2 border rounded-md hover:bg-gray-50"
          >
            {t('admin.applicationDetails.back')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Application Status Panel */}
        <div className="col-span-1 bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">{t('admin.applicationDetails.status')}</h2>
          
          <div className="mb-4">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.applicationDetails.currentStatus')}
            </span>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
              ${application.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
              ${application.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
              ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${application.status === 'reviewing' ? 'bg-blue-100 text-blue-800' : ''}
            `}>
              {t(`admin.applications.status${application.status.charAt(0).toUpperCase() + application.status.slice(1)}`)}
            </span>
          </div>
          
          <div className="mb-4">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.applicationDetails.updateStatus')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStatusChange('reviewing')}
                disabled={application.status === 'reviewing'}
                className={`px-3 py-2 text-sm rounded-md ${
                  application.status === 'reviewing' 
                    ? 'bg-blue-100 text-blue-800 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Clock className="inline-block h-4 w-4 mr-1" />
                {t('admin.applications.statusReviewing')}
              </button>
              
              <button
                onClick={() => handleStatusChange('pending')}
                disabled={application.status === 'pending'}
                className={`px-3 py-2 text-sm rounded-md ${
                  application.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed' 
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                {t('admin.applications.statusPending')}
              </button>
              
              <button
                onClick={() => handleStatusChange('approved')}
                disabled={application.status === 'approved'}
                className={`px-3 py-2 text-sm rounded-md ${
                  application.status === 'approved' 
                    ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <CheckCircle className="inline-block h-4 w-4 mr-1" />
                {t('admin.applications.statusApproved')}
              </button>
              
              <button
                onClick={() => handleStatusChange('rejected')}
                disabled={application.status === 'rejected'}
                className={`px-3 py-2 text-sm rounded-md ${
                  application.status === 'rejected' 
                    ? 'bg-red-100 text-red-800 cursor-not-allowed' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                <XCircle className="inline-block h-4 w-4 mr-1" />
                {t('admin.applications.statusRejected')}
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">
                {t('admin.applicationDetails.priority')}
              </span>
              {!editingPriority && (
                <button
                  onClick={() => {
                    setSelectedPriority(application.priority);
                    setEditingPriority(true);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {editingPriority ? (
              <div className="space-y-2">
                <select
                  value={selectedPriority || ''}
                  onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                  className="block w-full p-2 border rounded-md text-sm"
                >
                  <option value="">{t('admin.applicationDetails.noPriority')}</option>
                  <option value="low">{t('admin.applicationDetails.lowPriority')}</option>
                  <option value="medium">{t('admin.applicationDetails.mediumPriority')}</option>
                  <option value="high">{t('admin.applicationDetails.highPriority')}</option>
                </select>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingPriority(false)}
                    className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    {t('admin.applicationDetails.cancel')}
                  </button>
                  <button
                    onClick={handlePrioritySave}
                    className="px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Save className="inline-block h-4 w-4 mr-1" />
                    {t('admin.applicationDetails.save')}
                  </button>
                </div>
              </div>
            ) : (
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                ${application.priority === 'high' ? 'bg-red-100 text-red-800' : ''}
                ${application.priority === 'medium' ? 'bg-orange-100 text-orange-800' : ''}
                ${application.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                ${!application.priority ? 'bg-gray-100 text-gray-800' : ''}
              `}>
                {application.priority 
                  ? t(`admin.applicationDetails.${application.priority}Priority`) 
                  : t('admin.applicationDetails.noPriority')}
              </span>
            )}
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">
              {t('admin.applicationDetails.dates')}
            </div>
            <div className="text-sm">
              <div className="flex items-center mb-1">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-500 mr-1">{t('admin.applicationDetails.submitted')}:</span>
                {format(new Date(application.createdAt), 'MMM dd, yyyy')}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-500 mr-1">{t('admin.applicationDetails.lastUpdated')}:</span>
                {format(new Date(application.lastUpdated), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </div>

        {/* Applicant Details */}
        <div className="col-span-2 bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">{t('admin.applicationDetails.applicantDetails')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.fullName')}</span>
              <span className="block">{application.applicantName}</span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.email')}</span>
              <span className="block">{application.email}</span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.phone')}</span>
              <span className="block">{application.phone}</span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.dateOfBirth')}</span>
              <span className="block">{format(new Date(application.dateOfBirth), 'MMM dd, yyyy')}</span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.gender')}</span>
              <span className="block">{application.gender}</span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.nationality')}</span>
              <span className="block">{application.nationality}</span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.address')}</span>
              <span className="block">{application.address}</span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.program')}</span>
              <span className="block">{application.program}</span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.faculty')}</span>
              <span className="block">{application.faculty}</span>
            </div>
            
            {application.refugeeStatus && (
              <div>
                <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.refugeeId')}</span>
                <span className="block">{application.refugeeId || '-'}</span>
              </div>
            )}
            
            {!application.refugeeStatus && application.passportNumber && (
              <div>
                <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.passportNumber')}</span>
                <span className="block">{application.passportNumber}</span>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-medium mb-2">{t('admin.applicationDetails.emergencyContact')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.contactName')}</span>
                <span className="block">{application.emergencyContact.name}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.relationship')}</span>
                <span className="block">{application.emergencyContact.relationship}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 block">{t('admin.applicationDetails.contactPhone')}</span>
                <span className="block">{application.emergencyContact.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Background */}
        <div className="col-span-3 bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            {t('admin.applicationDetails.educationalBackground')}
          </h2>
          
          {application.educationRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.applicationDetails.institution')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.applicationDetails.degree')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.applicationDetails.fieldOfStudy')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.applicationDetails.period')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.applicationDetails.grade')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {application.educationRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.institution}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.degree}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.fieldOfStudy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(record.startDate), 'MMM yyyy')} - 
                        {record.endDate ? format(new Date(record.endDate), ' MMM yyyy') : ' Present'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.grade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">{t('admin.applicationDetails.noEducationRecords')}</p>
          )}
        </div>
        
        {/* Documents */}
        <div className="col-span-3 bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Paperclip className="h-5 w-5 mr-2" />
            {t('admin.applicationDetails.documents')}
          </h2>
          
          {application.documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {application.documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-xs text-gray-500">
                        {(doc.size / 1024 / 1024).toFixed(2)} MB • {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDocumentDownload(doc.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{t('admin.applicationDetails.noDocuments')}</p>
          )}
        </div>
        
        {/* Comments */}
        <div className="col-span-3 bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            {t('admin.applicationDetails.comments')}
          </h2>
          
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('admin.applicationDetails.addComment')}
                className="flex-1 p-3 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || addCommentMutation.isPending}
                className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {t('admin.applicationDetails.post')}
              </button>
            </div>
          </form>
          
          <div className="space-y-4">
            {application.comments.length > 0 ? (
              application.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {comment.userName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  <p className="text-gray-800">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">{t('admin.applicationDetails.noComments')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;