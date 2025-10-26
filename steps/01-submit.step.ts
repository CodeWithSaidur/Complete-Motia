import { ApiRouteConfig } from 'motia'
import { z } from 'zod'

const createYTSchema = z.object({
  channel: z.string().min(1, 'Channel is required'),
  email: z.string().email('Invalid email format')
})

export const config: ApiRouteConfig = {
  name: 'CreateYT',
  type: 'api',
  path: '/yt',
  method: 'POST',
  bodySchema: createYTSchema,
  flows: ['YTManagement'], // 1
  emits: ['YT.submit'] // 2
}

interface CreateYTRequest {
  channel: string
  email: string
}

export const handler = async (
  req: { body: CreateYTRequest },
  { emit, logger, state }: { emit: Function; logger: any; state: any }
) => {
  try {
    const { channel, email } = req.body

    const jobId = `job_${Date.now()}`

    const jobData = {
      jobId,
      channel,
      email,
      state: 'Created',
      createdAt: new Date().toISOString()
    }

    await state.set(`job:${jobId}`, jobData)

    logger.info('Job Created', jobData)

    await emit({
      topic: 'YT.submit',
      data: { jobId, channel, email }
    })

    return {
      status: 201,
      body: {
        success: true,
        jobId,
        message: 'Request submitted!'
      }
    }
  } catch (error: any) {
    logger.error('Error in CreateYT', { error: error.message })
    return {
      status: 500,
      body: { error: 'Internal server error' }
    }
  }
}
