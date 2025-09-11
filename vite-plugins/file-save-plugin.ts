import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

export function fileSavePlugin(): Plugin {
  return {
    name: 'file-save-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-json', async (req, res, next) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', async () => {
            try {
              const { filename, data } = JSON.parse(body)
              
              // Determine the correct file path
              const publicDir = path.join(process.cwd(), 'public', 'data')
              const filePath = path.join(publicDir, filename.endsWith('.json') ? filename : `${filename}.json`)
              
              // Ensure the directory exists
              if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true })
              }
              
              // Write the file
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
              
              console.log(`✅ File saved successfully: ${filePath}`)
              
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({
                success: true,
                message: `✅ تم حفظ الملف ${filename} بنجاح!\n✅ File ${filename} saved successfully!`
              }))
            } catch (error) {
              console.error('Error saving file:', error)
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({
                success: false,
                message: `❌ خطأ في حفظ الملف\n❌ Error saving file`,
                error: error instanceof Error ? error.message : 'Unknown error'
              }))
            }
          })
        } else {
          next()
        }
      })

      server.middlewares.use('/api/save-public-file', async (req, res, next) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', async () => {
            try {
              const { path: filePath, data } = JSON.parse(body)
              
              // Construct the full file path
              const fullPath = path.join(process.cwd(), 'public', filePath)
              const dir = path.dirname(fullPath)
              
              // Ensure the directory exists
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
              }
              
              // Write the file
              fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8')
              
              console.log(`✅ Public file updated: ${fullPath}`)
              
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({
                success: true,
                message: 'File updated successfully'
              }))
            } catch (error) {
              console.error('Error updating public file:', error)
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({
                success: false,
                message: 'Error updating file',
                error: error instanceof Error ? error.message : 'Unknown error'
              }))
            }
          })
        } else {
          next()
        }
      })
    }
  }
}
