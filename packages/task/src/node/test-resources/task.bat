@echo off

for /l %%x in (1,1,3) do (
   echo tasking... %*
   @REM sleep for ~1s
   @REM  see: https://stackoverflow.com/questions/735285/how-to-wait-in-a-batch-script
   ping 192.0.2.2 -n 1 -w 1000> nul
)
echo "done"