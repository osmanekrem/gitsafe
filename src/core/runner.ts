import { exec } from 'child_process';

export function runCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`\n> ${command}`);
        const childProcess = exec(command);
        childProcess.stdout?.on('data', (data) => {
            process.stdout.write(data);
        });
        childProcess.stderr?.on('data', (data) => {
            process.stderr.write(data);
        });
        childProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`\n❌ Komut, ${code} hata kodu ile sonlandı.`);
                reject(new Error(`Komut '${command}' ${code} kodu ile sonlandı.`));
            } else {
                resolve();
            }
        });
        childProcess.on('error', (err) => {
            console.error(`\n❌ Komut çalıştırılamadı: ${err.message}`);
            reject(err);
        });
    });
}