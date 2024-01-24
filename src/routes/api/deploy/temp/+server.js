import { json, error as server_error } from '@sveltejs/kit'
import supabase_admin from '$lib/supabase/admin'
import axios from 'axios'
import * as os from 'os';
import * as fs from 'fs';

export async function POST({ request, locals }) {
    const session = await locals.getSession();

    if (!session) {
        // the user is not signed in
        throw server_error(401, { message: 'Unauthorized' });
    }

    const { files, site_name } = await request.json();

    // create dir in tmp dir with name as site name and copy files to it
    const tmp_path = os.tmpdir() + "/" + site_name;
    if (fs.existsSync(tmp_path) && fs.lstatSync(tmp_path).isDirectory()) {
        fs.rmSync(tmp_path, { recursive: true });
    }

    fs.mkdirSync(tmp_path);

    files.forEach(({ path, content }) => {

        let arr = path.split("/");
        let file = arr[arr.length - 1];
        let file_write_path = tmp_path;
        let p = arr.slice(0, arr.length - 1).join("/");
        if (p != '') {
            fs.mkdirSync(tmp_path + "/" + p, { recursive: true });
            file_write_path = tmp_path + "/" + p;
        }
        fs.writeFileSync(file_write_path + "/" + file, content);

    });


    return json({ path: tmp_path });

}