export default function status(_context) {
    return {
        output: [
            'figma-mcp v1.0.0',
            'Transport: sse',
            'URL: http://localhost:3845/sse',
            'Tools: get_file, get_file_nodes, get_images, get_comments, post_comment, get_team_projects, get_project_files',
            'Status: ready',
        ].join('\n'),
        exitCode: 0,
    };
}
