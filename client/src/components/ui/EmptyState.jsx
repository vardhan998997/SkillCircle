import React from 'react'
import { Link } from 'react-router-dom'

const EmptyState = ({ 
  title = 'No items found', 
  description = 'Get started by creating a new item.',
  icon: Icon,
  actionLink,
  actionText = 'Create New',
  noAction = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center my-6">
      <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-50 mb-4">
        {Icon && <Icon className="h-8 w-8 text-primary-600" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">{description}</p>
      
      {!noAction && actionLink && (
        <Link to={actionLink} className="btn-primary">
          {actionText}
        </Link>
      )}
    </div>
  )
}

export default EmptyState