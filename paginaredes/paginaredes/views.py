#from django.http import HttpResponse
from django.shortcuts import render,redirect

def dashboard(request):
    #return HttpResponse("Hello World")
    return render(request, 'dashboard.html')

def calendar(request):
    #return HttpResponse("El pepe ete sech")
    return render(request, 'calendar.html')

def tasks(request):
    #return HttpResponse("Ete sech")
    return render(request, 'tasks.html')

def redirectToDashboard(request):
    return redirect('dashboard/')