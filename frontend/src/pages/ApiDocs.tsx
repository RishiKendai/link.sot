/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import './ApiDocs.css';

interface ApiEndpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  parameters?: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: ApiResponse[];
  examples?: ApiExample[];
}

interface ApiParameter {
  name: string;
  in: 'query' | 'path';
  required: boolean;
  type: string;
  description: string;
  example?: string;
}

interface ApiRequestBody {
  required: boolean;
  schema: any;
  example?: any;
}

interface ApiResponse {
  code: string;
  description: string;
  schema?: any;
  example?: any;
}

interface ApiExample {
  name: string;
  request?: any;
  response?: any;
}

const ApiDocs: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState<string>('get-links');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['get-links']));
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Handle responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const endpoints: ApiEndpoint[] = [
    {
      method: 'GET',
      path: '/api/v1/external/links',
      summary: 'Get all links',
      description: 'Retrieve a paginated list of all links for the authenticated user.',
      parameters: [
        {
          name: 'page',
          in: 'query',
          required: false,
          type: 'integer',
          description: 'Page number for pagination (default: 1)',
          example: '1'
        },
        {
          name: 'page_size',
          in: 'query',
          required: false,
          type: 'integer',
          description: 'Number of items per page (max: 25, default: 10)',
          example: '10'
        }
      ],
      responses: [
        {
          code: '200',
          description: 'Successfully retrieved links',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  links: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        uid: { type: 'string' },
                        original_url: { type: 'string' },
                        short_link: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        expiry_date: { type: 'string', format: 'date-time' },
                        password: { type: 'string', nullable: true },
                        is_flagged: { type: 'boolean' },
                        is_custom_backoff: { type: 'boolean' },
                        updated_at: { type: 'string', format: 'date-time' },
                        tags: { type: 'array', items: { type: 'string' } }
                      }
                    }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      total: { type: 'integer' },
                      page: { type: 'integer' },
                      page_size: { type: 'integer' },
                      total_pages: { type: 'integer' }
                    }
                  }
                }
              }
            }
          },
          example: {
            status: 'success',
            data: {
              links: [
                {
                  uid: 'link_123',
                  original_url: 'https://example.com/very-long-url',
                  short_link: 'abc123',
                  created_at: '2024-01-15T10:30:00Z',
                  expiry_date: '2024-02-15T10:30:00Z',
                  password: null,
                  is_flagged: false,
                  is_custom_backoff: false,
                  updated_at: '2024-01-15T10:30:00Z',
                  tags: ['important', 'work']
                }
              ],
              pagination: {
                total: 1,
                page: 1,
                page_size: 10,
                total_pages: 1
              }
            }
          }
        },
        {
          code: '401',
          description: 'Unauthorized - Invalid or missing authentication',
          example: {
            status: 'error',
            message: 'Unauthorized'
          }
        },
        {
          code: '400',
          description: 'Bad Request - Invalid query parameters',
          example: {
            status: 'error',
            message: 'page_size cannot be greater than 25'
          }
        }
      ]
    },
    {
      method: 'POST',
      path: '/api/v1/external/links',
      summary: 'Create a new short link',
      description: 'Create a new shortened URL with optional customization.',
      requestBody: {
        required: true,
        schema: {
          type: 'object',
          required: ['original_url'],
          properties: {
            original_url: { type: 'string', description: 'The original URL to shorten' },
            expiry_date: { type: 'string', format: 'date-time', description: 'Expiration date (optional)' },
            password: { type: 'string', description: 'Password protection (optional)' },
            is_flagged: { type: 'boolean', description: 'Mark as flagged (default: false)' },
            custom_backoff: { type: 'string', description: 'Custom short code (optional)' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags for organization' }
          }
        },
        example: {
          original_url: 'https://example.com/very-long-url-that-needs-shortening',
          expiry_date: '2024-12-31T23:59:59Z',
          password: 'secret123',
          is_flagged: false,
          custom_backoff: 'my-link',
          tags: ['important', 'work']
        }
      },
      responses: [
        {
          code: '200',
          description: 'Successfully created short link',
          schema: {
            type: 'object',
            properties: {
              short_code: { type: 'string' },
              short_url: { type: 'string' },
              expires_at: { type: 'string', format: 'date-time' },
              original_url: { type: 'string' }
            }
          },
          example: {
            short_code: 'abc123',
            short_url: 'https://yourdomain.com/abc123',
            expires_at: '2024-12-31T23:59:59Z',
            original_url: 'https://example.com/very-long-url-that-needs-shortening'
          }
        },
        {
          code: '400',
          description: 'Bad Request - Invalid request body',
          example: {
            status: 'error',
            message: 'original_url is required'
          }
        },
        {
          code: '401',
          description: 'Unauthorized - Invalid or missing authentication',
          example: {
            status: 'error',
            message: 'Unauthorized'
          }
        },
        {
          code: '409',
          description: 'Conflict - Custom short code already exists',
          example: {
            status: 'error',
            message: 'Custom short code already exists'
          }
        }
      ]
    },
    {
      method: 'PUT',
      path: '/api/v1/external/links/{id}',
      summary: 'Update an existing link',
      description: 'Update an existing short link with new properties.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          type: 'string',
          description: 'The short code of the link to update',
          example: 'abc123'
        }
      ],
      requestBody: {
        required: true,
        schema: {
          type: 'object',
          properties: {
            original_url: { type: 'string', description: 'The new original URL' },
            expiry_date: { type: 'string', format: 'date-time', description: 'New expiration date' },
            password: { type: 'string', description: 'New password protection' },
            is_flagged: { type: 'boolean', description: 'Mark as flagged' },
            custom_backoff: { type: 'string', description: 'New custom short code' },
            tags: { type: 'array', items: { type: 'string' }, description: 'New tags' }
          }
        },
        example: {
          original_url: 'https://example.com/updated-url',
          expiry_date: '2024-12-31T23:59:59Z',
          password: 'newpassword',
          is_flagged: false,
          custom_backoff: 'new-short-code',
          tags: ['updated', 'important']
        }
      },
      responses: [
        {
          code: '200',
          description: 'Successfully updated link',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              short_link: { type: 'string' },
              message: { type: 'string' }
            }
          },
          example: {
            status: 'success',
            short_link: 'https://yourdomain.com/new-short-code',
            message: 'Link updated successfully'
          }
        },
        {
          code: '400',
          description: 'Bad Request - Invalid request body',
          example: {
            status: 'error',
            message: 'Invalid request body'
          }
        },
        {
          code: '401',
          description: 'Unauthorized - Invalid or missing authentication',
          example: {
            status: 'error',
            message: 'Unauthorized'
          }
        },
        {
          code: '404',
          description: 'Not Found - Link not found',
          example: {
            status: 'error',
            message: 'Link not found'
          }
        },
        {
          code: '409',
          description: 'Conflict - Custom short code already exists',
          example: {
            status: 'error',
            message: 'Custom short code already exists'
          }
        }
      ]
    },
    {
      method: 'DELETE',
      path: '/api/v1/external/links/{id}',
      summary: 'Delete a link',
      description: 'Soft delete an existing short link.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          type: 'string',
          description: 'The short code of the link to delete',
          example: 'abc123'
        }
      ],
      responses: [
        {
          code: '200',
          description: 'Successfully deleted link',
          schema: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              message: { type: 'string' }
            }
          },
          example: {
            status: 'success',
            message: 'Link deleted successfully'
          }
        },
        {
          code: '401',
          description: 'Unauthorized - Invalid or missing authentication',
          example: {
            status: 'error',
            message: 'Unauthorized'
          }
        },
        {
          code: '404',
          description: 'Not Found - Link not found',
          example: {
            status: 'error',
            message: 'Link not found'
          }
        }
      ]
    }
  ];

  const toggleSection = (endpointId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(endpointId)) {
      newExpanded.delete(endpointId);
    } else {
      newExpanded.add(endpointId);
    }
    setExpandedSections(newExpanded);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return '#61affe';
      case 'POST': return '#49cc90';
      case 'PUT': return '#fca130';
      case 'DELETE': return '#f93e3e';
      default: return '#61affe';
    }
  };

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="api-docs">
      <div className="api-docs-header gsbb p-8 text-center text-white">
        <h1 className='mb-2 text-4xl font-bold'>External Links API Documentation</h1>
        <p className='text-white/70'>Complete API reference for the external links service</p>
      </div>

      <div className="api-docs-content">
        <div className="api-docs-sidebar">
          <h3>Endpoints</h3>
          <nav>
            {endpoints.map((endpoint, index) => {
              const endpointId = `${endpoint.method.toLowerCase()}-${endpoint.path.split('/').pop()}`;
              return (
                <button
                  key={index}
                  className={`sidebar-item ${activeEndpoint === endpointId ? 'active' : ''}`}
                  onClick={() => {
                    setActiveEndpoint(endpointId);
                    // Auto-expand the selected endpoint on mobile
                    if (isMobile) {
                      setExpandedSections(new Set([endpointId]));
                    }
                  }}
                >
                  <span className="method-badge" style={{ backgroundColor: getMethodColor(endpoint.method) }}>
                    {endpoint.method}
                  </span>
                  <span className="endpoint-path">{endpoint.path}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="api-docs-main">
          {endpoints.map((endpoint, index) => {
            const endpointId = `${endpoint.method.toLowerCase()}-${endpoint.path.split('/').pop()}`;
            const isExpanded = expandedSections.has(endpointId);
            
            return (
              <div key={index} className={`endpoint-section ${activeEndpoint === endpointId ? 'active' : ''}`}>
                <div className="endpoint-header" onClick={() => toggleSection(endpointId)}>
                  <div className="endpoint-method">
                    <span className="method-tag" style={{ backgroundColor: getMethodColor(endpoint.method) }}>
                      {endpoint.method}
                    </span>
                    <span className="endpoint-path" title={endpoint.path}>
                      {endpoint.path}
                    </span>
                  </div>
                  <div className="endpoint-summary">{endpoint.summary}</div>
                  <button className={`expand-button ${isExpanded ? 'expanded' : ''}`}>
                    ▼
                  </button>
                </div>

                {isExpanded && (
                  <div className="endpoint-content">
                    <div className="endpoint-description">
                      <p>{endpoint.description}</p>
                    </div>

                    {endpoint.parameters && endpoint.parameters.length > 0 && (
                      <div className="parameters-section">
                        <h4>Parameters</h4>
                        <div className="parameters-table">
                          <div className="parameter-header">
                            <span>Name</span>
                            <span>Type</span>
                            <span>Required</span>
                            <span>Description</span>
                          </div>
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="parameter-row">
                              <span className="param-name">{param.name}</span>
                              <span className="param-type">{param.type}</span>
                              <span className="param-required">{param.required ? 'Yes' : 'No'}</span>
                              <span className="param-description">{param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {endpoint.requestBody && (
                      <div className="request-body-section">
                        <h4>Request Body</h4>
                        <div className="schema-section">
                          <h5>Schema</h5>
                          <pre className="json-schema">
                            {formatJson(endpoint.requestBody.schema)}
                          </pre>
                        </div>
                        {endpoint.requestBody.example && (
                          <div className="example-section">
                            <h5>Example</h5>
                            <pre className="json-example">
                              {formatJson(endpoint.requestBody.example)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="responses-section">
                      <h4>Responses</h4>
                      {endpoint.responses.map((response, responseIndex) => (
                        <div key={responseIndex} className="response-item">
                          <div className="response-header">
                            <span className={`status-code status-${response.code}`}>
                              {response.code}
                            </span>
                            <span className="response-description">{response.description}</span>
                          </div>
                          {response.schema && (
                            <div className="response-schema">
                              <h5>Schema</h5>
                              <pre className="json-schema">
                                {formatJson(response.schema)}
                              </pre>
                            </div>
                          )}
                          {response.example && (
                            <div className="response-example">
                              <h5>Example</h5>
                              <pre className="json-example">
                                {formatJson(response.example)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApiDocs; 