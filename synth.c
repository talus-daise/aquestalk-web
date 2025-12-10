#include <windows.h>
#include <stdio.h>
#include <stdlib.h>

typedef unsigned char *(__stdcall *AQS_SYN)(
    const char *text, int speed, int *size);
typedef void(__stdcall *AQS_FREE)(unsigned char *);

int main(int argc, char *argv[])
{
    if (argc < 4)
        return 1;

    const char *text = argv[1]; // Shift_JIS
    int speed = atoi(argv[2]);
    const char *outPath = argv[3];

    // exe と同じ場所の DLL をロード
    HMODULE hDll = LoadLibraryA("AquesTalk.dll");
    if (!hDll)
    {
        fprintf(stderr, "DLL load failed\n");
        return 2;
    }

    AQS_SYN Synth = (AQS_SYN)GetProcAddress(hDll, "AquesTalk_Synthe");
    AQS_FREE FreeW = (AQS_FREE)GetProcAddress(hDll, "AquesTalk_FreeWave");
    if (!Synth || !FreeW)
        return 3;

    int size = 0;
    unsigned char *wav = Synth(text, speed, &size);
    if (!wav || size <= 0)
        return 4;

    FILE *fp = fopen(outPath, "wb");
    fwrite(wav, 1, size, fp);
    fclose(fp);

    FreeW(wav);
    FreeLibrary(hDll);
    return 0;
}